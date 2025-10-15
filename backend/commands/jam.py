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

        jam: JamModel = JamModel(
            period=period_num,
            jam=jam_num,
            home=TeamJamModel(self.home),
            away=TeamJamModel(self.away),
        )
        self.bout.jams.append(jam)

    @override
    async def undo(self, db: AsyncSession) -> None:
        return  # TODO


class StartJamCommand(Command):
    def __init__(self, bout: GenericBoutModel, timestamp: datetime) -> None:
        self.bout: GenericBoutModel = bout
        self.timestamp: datetime = timestamp

    @override
    def execute(self, db: AsyncSession) -> None:
        self.bout.jams[-1].start(self.timestamp)

    @override
    async def undo(self, db: AsyncSession) -> None:
        return  #  TODO:


class StopJamCommand(Command):
    def __init__(self, bout: GenericBoutModel, timestamp: datetime) -> None:
        self.bout: GenericBoutModel = bout
        self.timestamp: datetime = timestamp

    @override
    def execute(self, db: AsyncSession) -> None:
        self.bout.jams[-1].stop(self.timestamp)

    @override
    async def undo(self, db: AsyncSession) -> None:
        return  # TODO
