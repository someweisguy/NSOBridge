from datetime import datetime
from typing import override

from models import GenericBoutModel

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
