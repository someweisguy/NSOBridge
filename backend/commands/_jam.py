from typing import override

from models.jam import TeamJamModel, TripEventModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import make_transient

from commands._commands import Command


class AddTrip(Command):
    def __init__(self, team_jam: TeamJamModel, trip_event: TripEventModel) -> None:
        self.detached_parent: TeamJamModel = team_jam
        self.trip_event: TripEventModel = trip_event

    @override
    async def execute(self, db: AsyncSession) -> None:
        team_jam: TeamJamModel = await db.merge(self.detached_parent)
        if self.trip_event.team_jam is None:
            team_jam.events.append(self.trip_event)
        else:
            _ = await db.merge(self.trip_event)

    @override
    async def undo(self, db: AsyncSession) -> None:
        await db.delete(self.trip_event)
        make_transient(self.trip_event)


# TODO: DeleteTrip


# TODO: EditTrip
