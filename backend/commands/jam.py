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
    def execute(self, db: AsyncSession) -> None:
        # Determine what the next Jam and Period number should be
        period_num: int = 0
        jam_num: int = 0
        if len(self.bout.jams) > 0:
            latest: JamModel = self.bout.jams[-1]
            period_num = latest.period
            if self.create_new_period:
                period_num += 1
            else:
                jam_num = latest.jam + 1

        # Instantiate the Jam if it hasn't been already
        if self.jam is None:
            self.jam = JamModel(
                period=period_num,
                jam=jam_num,
                home=TeamJamModel(self.home),
                away=TeamJamModel(self.away),
            )
        elif self.jam.period != period_num or self.jam.jam != jam_num:
            # Another user has created a Jam with this Period and Jam number already
            raise RuntimeError('Bout state is invalid')

        self.bout.jams.append(self.jam)

    @override
    async def undo(self, db: AsyncSession) -> None:
        assert self.jam is not None

        self.bout.jams.remove(self.jam)
        await db.delete(self.jam)


class StartJamCommand(Command):
    def __init__(self, bout: GenericBoutModel, timestamp: datetime) -> None:
        self.bout: GenericBoutModel = bout
        self.timestamp: datetime = timestamp
        self.jam: JamModel | None = None

    @override
    def execute(self, db: AsyncSession) -> None:
        if self.jam is None:
            self.jam = self.bout.jams[-1]

        if self.jam != self.bout.jams[-1]:
            raise RuntimeError('Invalid Bout state')

        self.jam.start(self.timestamp)

    @override
    async def undo(self, db: AsyncSession) -> None:
        assert self.jam is not None

        # Ensure that only the latest Jam is modified
        if self.jam != self.bout.jams[-1]:
            raise RuntimeError('Invalid Bout state')

        self.jam.start_timestamp = None


class StopJamCommand(Command):
    def __init__(self, bout: GenericBoutModel, timestamp: datetime) -> None:
        self.bout: GenericBoutModel = bout
        self.timestamp: datetime = timestamp
        self.jam: JamModel | None = None

    @override
    def execute(self, db: AsyncSession) -> None:
        if self.jam is None:
            self.jam = self.bout.jams[-1]

        # Ensure only the latest Jam is modified
        if self.jam != self.bout.jams[-1]:
            raise RuntimeError('Invalid Bout state')

        self.jam.stop(self.timestamp)

    @override
    async def undo(self, db: AsyncSession) -> None:
        assert self.jam is not None

        # Ensure that only the latest Jam is modified
        if self.jam != self.bout.jams[-1]:
            raise RuntimeError('Invalid Bout state')

        self.jam.stop_timestamp = None
