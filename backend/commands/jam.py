from datetime import datetime
from typing import override

from models import AsyncSession, GenericBoutModel, JamModel, TeamJamModel, TeamModel

from .commands import Command


class CreateJamCommand(Command):
    def __init__(
        self,
        bout: GenericBoutModel,
        home: TeamModel,
        away: TeamModel,
        create_new_period: bool = False,
    ) -> None:
        self.bout: GenericBoutModel = bout
        self.home: TeamModel = home
        self.away: TeamModel = away
        self.create_new_period: bool = create_new_period
        self.jam: JamModel | None = None

    @override
    async def _merge(self, db: AsyncSession) -> None:
        self.bout = await db.merge(self.bout)
        self.home = await db.merge(self.home)
        self.away = await db.merge(self.away)
        self.jam = await db.merge(self.jam)

    @override
    def execute(self, db: AsyncSession) -> None:
        period_num: int = 0
        jam_num: int = 0
        if len(self.bout.jams) > 0:
            latest: JamModel = self.bout.jams[-1]
            period_num = latest.period
            if self.create_new_period:
                period_num += 1
            else:
                jam_num = latest.jam + 1

        if self.jam is None:
            self.jam = JamModel(
                period=period_num,
                jam=jam_num,
                home=TeamJamModel(self.home),
                away=TeamJamModel(self.away),
            )

        if self.jam.period != period_num or self.jam.jam != jam_num:
            raise RuntimeError('Cannot redo Create Jam; Bout state is invalid')

        self.bout.jams.append(self.jam)
        self.jam.bout = self.bout

    @override
    async def undo(self, db: AsyncSession) -> None:
        assert self.jam is not None
        await self._merge(db)
        self.bout.jams.remove(self.jam)
        await db.delete(self.jam)


class StartJamCommand(Command):
    def __init__(self, bout: GenericBoutModel, timestamp: datetime) -> None:
        self.bout: GenericBoutModel = bout
        self.timestamp: datetime = timestamp
        self.jam: JamModel | None = None

    @override
    async def _merge(self, db: AsyncSession) -> None:
        self.bout = await db.merge(self.bout)
        self.jam = await db.merge(self.jam)

    @override
    def execute(self, db: AsyncSession) -> None:
        if self.jam is None:
            self.jam = self.bout.jams[-1]

        if self.jam.id != self.bout.jams[-1].id:
            raise RuntimeError('Invalid Bout state')

        self.jam.start(self.timestamp)

    @override
    async def undo(self, db: AsyncSession) -> None:
        assert self.jam is not None
        await self._merge(db)
        
        # Ensure that only the latest Jam is modified
        if self.jam.id != self.bout.jams[-1].id:
            raise RuntimeError('Invalid Bout state')
        
        self.jam.start_timestamp = None


class StopJamCommand(Command):
    def __init__(self, bout: GenericBoutModel, timestamp: datetime) -> None:
        self.bout: GenericBoutModel = bout
        self.timestamp: datetime = timestamp
        self.jam: JamModel | None = None
        
    @override
    async def _merge(self, db: AsyncSession) -> None:
        self.bout = await db.merge(self.bout)
        self.jam = await db.merge(self.jam)

    @override
    def execute(self, db: AsyncSession) -> None:
        if self.jam is None:
            self.jam = self.bout.jams[-1]
        
        # Ensure only the latest Jam is modified
        if self.jam.id != self.bout.jams[-1].id:
            raise RuntimeError('Invalid Bout state')
        
        self.jam.stop(self.timestamp)

    @override
    async def undo(self, db: AsyncSession) -> None:
        assert self.jam is not None
        await self._merge(db)
        
        # Ensure that only the latest Jam is modified
        if self.jam.id != self.bout.jams[-1].id:
            raise RuntimeError('Invalid Bout state')
        
        self.jam.stop_timestamp = None
