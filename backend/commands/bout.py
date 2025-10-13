from datetime import datetime
from typing import override

from models import GenericBoutModel, JamModel
from models.time import TimeoutModel

from .commands import Command


class SetBoutIsRunningCommand(Command):
    def __init__(self, bout: GenericBoutModel, is_running: bool) -> None:
        self.bout: GenericBoutModel = bout
        self.is_running: bool = is_running

    @override
    def execute(self) -> None:
        self.bout.is_running = self.is_running
        if self.bout.is_running:
            self.bout.expected_start_timestamp = None


class SetNextPeriodStartTime(Command):
    def __init__(
        self, bout: GenericBoutModel, start_timestamp: datetime | None
    ) -> None:
        self.bout: GenericBoutModel = bout
        self.start_timestamp: datetime | None = start_timestamp

    @override
    def execute(self) -> None:
        self.bout.expected_start_timestamp = self.start_timestamp


class SetBoutIsFinalCommand(Command):
    def __init__(self, bout: GenericBoutModel, is_final: bool) -> None:
        self.bout: GenericBoutModel = bout
        self.is_final: bool = is_final

    @override
    def execute(self) -> None:
        self.bout.is_final = self.is_final


class BoutStartTimeout(Command):
    def __init__(
        self, bout: GenericBoutModel, timestamp: datetime, stop_clock: bool = True
    ) -> None:
        self.bout: GenericBoutModel = bout
        self.timestamp: datetime = timestamp
        self.stop_clock: bool = stop_clock

    @override
    def execute(self) -> None:
        if self.stop_clock and self.bout.clock.is_running():
            self.bout.clock.stop(self.timestamp)

        # Timeouts are recorded on the latest running Jam
        latest: JamModel = (
            self.bout.jams[-2] if len(self.bout.jams) > 1 else self.bout.jams[-1]
        )
        timeout: TimeoutModel = TimeoutModel(
            period=latest.period,
            jam=latest.jam,
            start_timestamp=self.timestamp,
            clock_elapsed=self.bout.clock.get_duration(self.timestamp),
        )
        self.bout.timeouts.append(timeout)


class BoutStopTimeout(Command):
    def __init__(self, bout: GenericBoutModel, timestamp: datetime) -> None:
        self.bout: GenericBoutModel = bout
        self.timestamp: datetime = timestamp

    @override
    def execute(self) -> None:
        if self.bout.get_state() != 'timeout':
            raise RuntimeError('There is no active Timeout to stop')
        timeout: TimeoutModel = self.bout.timeouts[-1]

        timeout.stop(self.timestamp)

        # Decrement the Timeout or Official Review if it was not retained
        if timeout.team is not None and not timeout.retained:
            # Only decrement if the value is greater than zero
            if timeout.is_review and timeout.team.reviews_remaining > 0:
                timeout.team.reviews_remaining -= 1
            elif timeout.team.timeouts_remaining > 0:
                timeout.team.timeouts_remaining -= 1
