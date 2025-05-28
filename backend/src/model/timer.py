from datetime import datetime, timedelta
from math import floor
from typing import Annotated, Literal

from pydantic import Field, PlainSerializer

from model.team import AbstractReferee, ProjectModel, TeamString

type TeamOfficialString = TeamString | Literal['official']

type millisdelta = Annotated[
    timedelta,
    PlainSerializer(
        lambda td: floor(td.total_seconds() * 1000),
        when_used='unless-none',
        return_type=int,
    ),
]


class Timer(ProjectModel):
    start_timestamp: datetime | None = None
    elapsed: millisdelta = timedelta(seconds=0)

    def start(self, timestamp: datetime) -> None:
        if self.is_running():
            raise RuntimeError('This clock is already running')
        self.start_timestamp = timestamp

    def stop(self, timestamp: datetime) -> None:
        if self.start_timestamp is None:
            raise RuntimeError('This clock has already stopped')
        if self.start_timestamp > timestamp:
            raise ValueError('Timestamp is invalid')
        self.elapsed += timestamp - self.start_timestamp
        self.start_timestamp = None

    def is_running(self) -> bool:
        return self.start_timestamp is not None

    def reset(self) -> None:
        self.start_timestamp = None
        self.elapsed = timedelta(seconds=0)

    def get_elapsed_at_timestamp(self, timestamp: datetime) -> timedelta:
        elapsed = self.elapsed
        if self.start_timestamp is not None:
            elapsed += timestamp - self.start_timestamp
        return elapsed


class Clock(Timer):
    alarm: millisdelta = timedelta(seconds=0)

    def set_alarm(
        self,
        delta: timedelta | None = None,
        *,
        hours: float = 0,
        minutes: float = 0,
        seconds: float = 0,
        milliseconds: float = 0,
    ) -> None:
        if delta is not None:
            new_alarm = delta
        else:
            new_alarm: timedelta | None = timedelta(
                hours=hours, minutes=minutes, seconds=seconds, milliseconds=milliseconds
            )
        if new_alarm.total_seconds() <= 0:
            raise ValueError('Alarm value must be greater than 0 seconds')
        self.alarm = new_alarm


class Timeout(Timer):
    period_num: int = Field(final=True)
    jam_num: int = Field(final=True)
    period_clock_elapsed: millisdelta = Field(final=True)
    is_review: bool = False
    team: TeamOfficialString | None = None
    details: str = ''
    result: str = ''
    retained: bool = False


class TimeReferee(AbstractReferee):
    class Clocks(ProjectModel):
        intermission: Clock = Field(Clock(), final=True)
        game: Clock = Field(Clock(), final=True)
        lineup: Clock = Field(Clock(), final=True)
        jam: Clock = Field(Clock(), final=True)

    clocks: Clocks = Field(Clocks(), final=True)
    timeouts: list[Timeout] = Field([], final=True)

    def model_post_init(self, context):
        self.clocks.game.set_alarm(self.context.PERIOD_DURATION)
        self.clocks.jam.set_alarm(self.context.JAM_DURATION)
        self.clocks.lineup.set_alarm(self.context.LINEUP_DURATION)

    def start_jam(self, timestamp: datetime) -> None:
        if self.timeout_is_running():
            raise RuntimeError('Cannot start a Jam when a Timeout is running')
        for clock in [self.clocks.intermission, self.clocks.lineup]:
            if clock.is_running():
                clock.stop(timestamp)
        if not self.clocks.game.is_running():
            self.clocks.game.start(timestamp)
        self.clocks.jam.reset()
        self.clocks.jam.start(timestamp)

    def stop_jam(self, timestamp: datetime) -> None:
        if not self.clocks.jam.is_running():
            raise RuntimeError('Cannot stop a Jam when there is none running') from None
        self.clocks.jam.stop(timestamp)

        self.clocks.lineup.reset()
        self.clocks.lineup.start(timestamp)

    def timeout_is_running(self) -> bool:
        return len(self.timeouts) > 0 and self.timeouts[-1].is_running()

    def call_timeout(self, timestamp: datetime, period_num: int, jam_num: int) -> None:
        if not self.clocks.lineup.is_running():
            raise RuntimeError('A Timeout can only be called during Lineup')
        if self.timeout_is_running():
            raise RuntimeError('Cannot call a Timeout when one is already running')

        # Stop the Lineup clock and the Period clock if it is running
        if self.clocks.game.is_running():
            self.clocks.game.stop(timestamp)
        self.clocks.lineup.stop(timestamp)

        # Instantiate the Timeout
        period_clock_elapsed = self.clocks.game.get_elapsed_at_timestamp(timestamp)
        timeout: Timeout = Timeout(
            start_timestamp=timestamp,
            period_num=period_num,
            jam_num=jam_num,
            period_clock_elapsed=period_clock_elapsed,
        )
        self.timeouts.append(timeout)

    def end_timeout(self, timestamp: datetime) -> None:
        if not self.timeout_is_running():
            raise RuntimeError('Cannot end a Timeout when one is not running')
        timeout: Timeout = self.timeouts[-1]
        timeout.stop(timestamp)

        # Add the Timeout duration to the Lineup clock and start the Lineup clock
        # This is done because it can help prevent some logic errors in the frontend
        # code. The game-state will be 'lineup' only when the Lineup clock is running.
        self.clocks.lineup.elapsed += timeout.get_elapsed_at_timestamp(timestamp)
        self.clocks.lineup.start(timestamp)

        # Subtract the timeout or official review, if not retained
        if not timeout.is_review or not timeout.retained:
            timeout_type = 'review' if timeout.is_review else 'timeout'
            self.context[timeout.team].clock_stops[timeout_type] -= 1

    def edit_timeout(
        self,
        timeout_id: int,
        is_review: bool,
        team: TeamOfficialString,
        details: str,
        result: str,
        retained: bool,
    ) -> None:
        if is_review and team == 'official':
            raise RuntimeError('An Official Review must be called by a Team') from None
        timeout: Timeout = self.timeouts[timeout_id]
        timeout.is_review = is_review
        timeout.team = team
        timeout.details = details
        timeout.result = result
        timeout.retained = retained
