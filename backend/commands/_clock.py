from datetime import datetime, timedelta
from typing import override

from models import ClockModel
from sqlalchemy.ext.asyncio import AsyncSession

from ._commands import Command


class Start(Command):
    def __init__(self, clock: ClockModel, timestamp: datetime) -> None:
        self.detached_clock: ClockModel = clock
        self.timestamp: datetime = timestamp

    @override
    async def execute(self, session: AsyncSession) -> None:
        clock: ClockModel = await session.merge(self.detached_clock)
        if clock.is_running():
            raise RuntimeError('Clock is already running')
        clock.start_timestamp = self.timestamp

    @override
    async def undo(self, session: AsyncSession) -> None:
        clock: ClockModel = await session.merge(self.detached_clock)
        clock.start_timestamp = None


class Stop(Command):
    def __init__(self, clock: ClockModel, timestamp: datetime) -> None:
        self.detached_clock: ClockModel = clock
        self.timestamp: datetime = timestamp
        self.old_elapsed: timedelta = timedelta(seconds=0)
        self.old_start_timestamp: datetime = datetime.min

    @override
    async def execute(self, session: AsyncSession) -> None:
        clock: ClockModel = await session.merge(self.detached_clock)

        if clock.start_timestamp is None:
            raise RuntimeError('Cannot stop a Clock when it is already stopped')
        if self.timestamp < clock.start_timestamp:
            raise RuntimeError('Cannot stop a Clock before it has been started')

        self.old_elapsed = clock.elapsed
        self.old_start_timestamp = clock.start_timestamp
        clock.elapsed += self.timestamp - clock.start_timestamp
        clock.start_timestamp = None

    @override
    async def undo(self, session: AsyncSession) -> None:
        clock: ClockModel = await session.merge(self.detached_clock)

        clock.elapsed = self.old_elapsed
        clock.start_timestamp = self.old_start_timestamp


class Set(Command):
    def __init__(self, clock: ClockModel, elapsed: timedelta) -> None:
        self.detached_clock: ClockModel = clock
        self.elapsed: timedelta = elapsed
        self.old_elapsed: timedelta = timedelta(seconds=0)

    @override
    async def execute(self, session: AsyncSession) -> None:
        clock: ClockModel = await session.merge(self.detached_clock)
        if clock.is_running():
            raise RuntimeError('Cannot set a Clock when it is running')

        self.old_elapsed = clock.elapsed
        clock.elapsed = self.elapsed

    @override
    async def undo(self, session: AsyncSession) -> None:
        clock: ClockModel = await session.merge(self.detached_clock)

        clock.elapsed = self.old_elapsed


class Reset(Set):
    def __init__(self, clock: ClockModel) -> None:
        super().__init__(clock, timedelta(seconds=0))
