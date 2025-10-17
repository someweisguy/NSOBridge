from datetime import datetime
from typing import override

from models import GenericBoutModel, JamModel
from models.time import TimeoutModel
from sqlalchemy.ext.asyncio import AsyncSession

from commands._commands import Command


class Start(Command):
    def __init__(self, bout: GenericBoutModel, timestamp: datetime) -> None:
        self.bout: GenericBoutModel = bout
        self.timestamp: datetime = timestamp
        self.timeout: TimeoutModel | None = None

    @override
    def execute(self, db: AsyncSession) -> None:
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
    async def undo(self, db: AsyncSession) -> None:
        assert self.timeout is not None
        if self.timeout not in self.bout.timeouts:
            raise RuntimeError('Timeout does not exist')
        self.bout.timeouts.remove(self.timeout)
        await db.delete(self.timeout)


class Stop(Command):
    def __init__(self, bout: GenericBoutModel, timestamp: datetime) -> None:
        self.bout: GenericBoutModel = bout
        self.timestamp: datetime = timestamp
        self.timeout: TimeoutModel | None = None

    @override
    def execute(self, db: AsyncSession) -> None:
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
    async def undo(self, db: AsyncSession) -> None:
        assert self.timeout is not None
        if self.timeout != self.bout.timeouts[-1]:
            raise RuntimeError('Bout state is invalid')
        self.timeout.stop_timestamp = None
