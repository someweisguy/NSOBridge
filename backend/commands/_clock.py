from datetime import datetime, timedelta
from typing import override

from models import ClockModel
from sqlalchemy.ext.asyncio import AsyncSession

from ._commands import Command


class Start(Command):
    def __init__(self, clock: ClockModel, timestamp: datetime) -> None:
        self.clock: ClockModel = clock
        self.timestamp: datetime = timestamp

    @override
    async def execute(self, db: AsyncSession) -> None:
        if self.clock.is_running():
            raise RuntimeError('Clock is already running')
        self.clock.start_timestamp = self.timestamp

    @override
    async def undo(self, db: AsyncSession) -> None:
        self.clock.start_timestamp = None


class Stop(Command):
    def __init__(self, clock: ClockModel, timestamp: datetime) -> None:
        self.clock: ClockModel = clock
        self.timestamp: datetime = timestamp
        self.old_elapsed: timedelta | None = None
        self.old_start_timestamp: datetime | None = None

    @override
    async def execute(self, db: AsyncSession) -> None:
        if not self.clock.is_running():
            raise RuntimeError('Cannot stop a Clock when it is already stopped')
        assert self.clock.start_timestamp is not None
        if self.timestamp < self.clock.start_timestamp:
            raise RuntimeError('Cannot stop a Clock before it has been started')

        self.old_elapsed = self.clock.elapsed
        self.old_start_timestamp = self.clock.start_timestamp
        self.clock.elapsed += self.timestamp - self.clock.start_timestamp
        self.clock.start_timestamp = None

    @override
    async def undo(self, db: AsyncSession) -> None:
        if self.old_elapsed is None or self.old_start_timestamp is None:
            raise RuntimeError('This action has not been executed')

        self.clock.elapsed = self.old_elapsed
        self.clock.start_timestamp = self.old_start_timestamp


class Set(Command):
    def __init__(self, clock: ClockModel, elapsed: timedelta) -> None:
        self.clock: ClockModel = clock
        self.elapsed: timedelta = elapsed
        self.old_elapsed: timedelta | None = None

    @override
    async def execute(self, db: AsyncSession) -> None:
        if self.clock.is_running():
            raise RuntimeError('Cannot set a Clock when it is running')
        self.old_elapsed = self.clock.elapsed
        self.clock.elapsed = self.elapsed

    @override
    async def undo(self, db: AsyncSession) -> None:
        if self.old_elapsed is None:
            raise RuntimeError('This action has not been executed')
        self.clock.elapsed = self.old_elapsed


class Reset(Set):
    def __init__(self, clock: ClockModel) -> None:
        super().__init__(clock, timedelta(seconds=0))
