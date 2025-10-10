from datetime import datetime, timedelta
from typing import override

from models import ClockModel

from .commands import Command


class StartClockCommand(Command):
    def __init__(self, clock: ClockModel, timestamp: datetime) -> None:
        self.clock: ClockModel = clock
        self.timestamp: datetime = timestamp

    @override
    def execute(self) -> None:
        self.clock.start(self.timestamp)


class StopClockCommand(Command):
    def __init__(self, clock: ClockModel, timestamp: datetime) -> None:
        self.clock: ClockModel = clock
        self.timestamp: datetime = timestamp

    @override
    def execute(self) -> None:
        self.clock.stop(self.timestamp)


class SetClockCommand(Command):
    def __init__(self, clock: ClockModel, elapsed: timedelta) -> None:
        self.clock: ClockModel = clock
        self.elapsed: timedelta = elapsed

    @override
    def execute(self) -> None:
        if self.clock.is_running():
            raise RuntimeError('Cannot set a Clock when it is running')
        self.clock.elapsed = self.elapsed


class ResetClockCommand(SetClockCommand):
    def __init__(self, clock: ClockModel) -> None:
        super().__init__(clock, timedelta(seconds=0))
