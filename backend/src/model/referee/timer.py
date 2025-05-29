from datetime import datetime

from model.referee.base import AbstractReferee
from model.team import TeamOfficialString
from model.timer import Timeout


class TimeReferee(AbstractReferee):
    # TODO
    # def setup(self) -> None:
    #     self.context.clocks.game.set_alarm(self.context.PERIOD_DURATION)
    #     self.context.clocks.jam.set_alarm(self.context.JAM_DURATION)
    #     self.context.clocks.lineup.set_alarm(self.context.LINEUP_DURATION)

    def start_jam(self, timestamp: datetime) -> None:
        if self.timeout_is_running():
            raise RuntimeError('Cannot start a Jam when a Timeout is running')
        for clock in [self.context.clocks.intermission, self.context.clocks.lineup]:
            if clock.is_running():
                clock.stop(timestamp)
        if not self.context.clocks.game.is_running():
            self.context.clocks.game.start(timestamp)
        self.context.clocks.jam.reset()
        self.context.clocks.jam.start(timestamp)

    def stop_jam(self, timestamp: datetime) -> None:
        if not self.context.clocks.jam.is_running():
            raise RuntimeError('Cannot stop a Jam when there is none running') from None
        self.context.clocks.jam.stop(timestamp)

        self.context.clocks.lineup.reset()
        self.context.clocks.lineup.start(timestamp)

    def timeout_is_running(self) -> bool:
        return len(self.context.timeouts) > 0 and self.context.timeouts[-1].is_running()

    def call_timeout(self, timestamp: datetime, period_num: int, jam_num: int) -> None:
        if not self.context.clocks.lineup.is_running():
            raise RuntimeError('A Timeout can only be called during Lineup')
        if self.timeout_is_running():
            raise RuntimeError('Cannot call a Timeout when one is already running')

        # Stop the Lineup clock and the Period clock if it is running
        if self.context.clocks.game.is_running():
            self.context.clocks.game.stop(timestamp)
        self.context.clocks.lineup.stop(timestamp)

        # Instantiate the Timeout
        period_clock_elapsed = self.context.clocks.game.get_elapsed_at_timestamp(
            timestamp
        )
        timeout: Timeout = Timeout(
            start_timestamp=timestamp,
            period_num=period_num,
            jam_num=jam_num,
            period_clock_elapsed=period_clock_elapsed,
        )
        self.context.timeouts.append(timeout)

    def end_timeout(self, timestamp: datetime) -> None:
        if not self.timeout_is_running():
            raise RuntimeError('Cannot end a Timeout when one is not running')
        timeout: Timeout = self.timeouts[-1]
        timeout.stop(timestamp)

        # Add the Timeout duration to the Lineup clock and start the Lineup clock
        # This is done because it can help prevent some logic errors in the frontend
        # code. The game-state will be 'lineup' only when the Lineup clock is running.
        self.context.clocks.lineup.elapsed += timeout.get_elapsed_at_timestamp(
            timestamp
        )
        self.context.clocks.lineup.start(timestamp)

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
        timeout: Timeout = self.context.timeouts[timeout_id]
        timeout.is_review = is_review
        timeout.team = team
        timeout.details = details
        timeout.result = result
        timeout.retained = retained
