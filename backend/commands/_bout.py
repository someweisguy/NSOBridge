from datetime import datetime
from typing import override

from models import GenericBoutModel, JamModel
from models.time import TimeoutModel
from sqlalchemy import inspect
from sqlalchemy.ext.asyncio import AsyncSession

from commands._commands import Command


class SetPeriodCountdown(Command):
    def __init__(
        self, bout: GenericBoutModel, start_timestamp: datetime | None
    ) -> None:
        self.detached_bout: GenericBoutModel = bout
        self.new_value: datetime | None = start_timestamp
        self.old_value: datetime | None = None

    @override
    async def execute(self, session: AsyncSession) -> None:
        bout: GenericBoutModel = await session.merge(self.detached_bout)
        self.old_value = bout.expected_start_timestamp
        bout.expected_start_timestamp = self.new_value

    @override
    async def undo(self, session: AsyncSession) -> None:
        self.detached_bout.expected_start_timestamp = self.old_value


class SetIsRunning(Command):
    def __init__(self, bout: GenericBoutModel, is_running: bool) -> None:
        self.detached_bout: GenericBoutModel = bout
        self.new_value: bool = is_running
        self.old_value: bool = False

    @override
    async def execute(self, session: AsyncSession) -> None:
        bout: GenericBoutModel = await session.merge(self.detached_bout)
        self.old_value = bout.is_running
        bout.is_running = self.new_value

    @override
    async def undo(self, session: AsyncSession) -> None:
        bout: GenericBoutModel = await session.merge(self.detached_bout)
        bout.is_running = self.old_value


class SetIsFinal(Command):
    def __init__(self, bout: GenericBoutModel, is_final: bool) -> None:
        self.detached_bout: GenericBoutModel = bout
        self.new_value: bool = is_final
        self.old_value: bool = bout.is_final

    @override
    async def execute(self, session: AsyncSession) -> None:
        bout: GenericBoutModel = await session.merge(self.detached_bout)
        self.old_value = bout.is_final
        bout.is_final = self.new_value

    @override
    async def undo(self, session: AsyncSession) -> None:
        bout: GenericBoutModel = await session.merge(self.detached_bout)
        bout.is_final = self.old_value


# TODO: class SetOrder(Command)


class TimeoutStart(Command):
    def __init__(self, bout: GenericBoutModel, timestamp: datetime) -> None:
        self.bout: GenericBoutModel = bout
        self.timestamp: datetime = timestamp
        self.timeout: TimeoutModel | None = None

    @override
    async def execute(self, session: AsyncSession) -> None:
        latest_jam: JamModel | None = self.bout.get_latest_played_jam()
        if latest_jam is None:
            raise RuntimeError('A Timeout cannot be called until the Bout has started')
        if self.timeout is None:
            self.timeout = TimeoutModel(
                jam=latest_jam,
                start_timestamp=self.timestamp,
                clock_elapsed=self.bout.clock.get_duration(self.timestamp),
            )

        # Protect against redoing this command if the bout state is invalid
        if self.timeout.jam != latest_jam:
            raise RuntimeError('Bout state is invalid')

        self.bout.timeouts.append(self.timeout)

    @override
    async def undo(self, session: AsyncSession) -> None:
        assert self.timeout is not None
        if self.timeout not in self.bout.timeouts:
            raise RuntimeError('Timeout does not exist')
        await session.delete(self.timeout)


class TimeoutStop(Command):
    def __init__(self, bout: GenericBoutModel, timestamp: datetime) -> None:
        self.bout: GenericBoutModel = bout
        self.timestamp: datetime = timestamp
        self.timeout: TimeoutModel | None = None

    @override
    async def execute(self, session: AsyncSession) -> None:
        if self.bout.get_state() != 'timeout':
            raise RuntimeError('There is no active Timeout to stop')
        if self.timeout is None:
            if len(self.bout.timeouts) == 0:
                raise RuntimeError('There is no Timeout to stop')
            self.timeout = self.bout.timeouts[-1]

        # Protect against redoing this command if the bout state is invalid
        if self.timeout.jam != self.bout.timeouts[-1].jam:
            raise RuntimeError('Bout state is invalid')

        self.timeout.stop(self.timestamp)

    @override
    async def undo(self, session: AsyncSession) -> None:
        assert self.timeout is not None
        if self.timeout != self.bout.timeouts[-1]:
            raise RuntimeError('Bout state is invalid')
        self.timeout.stop_timestamp = None


class AddJam(Command):
    def __init__(self, bout: GenericBoutModel, jam: JamModel) -> None:
        self.detached_parent: GenericBoutModel = bout
        self.jam: JamModel = jam

    @override
    async def execute(self, session: AsyncSession) -> None:
        if inspect(self.jam).detached:
            # Handle redo
            _ = await session.merge(self.jam)
        else:
            # Handle initial insertion
            self.detached_parent.jams.append(self.jam)

    @override
    async def undo(self, session: AsyncSession) -> None:
        jam: JamModel = await session.merge(self.jam)
        await session.delete(jam)
        self.jam = jam
