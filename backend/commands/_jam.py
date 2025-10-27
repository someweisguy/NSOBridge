from typing import override

from models.jam import TeamJamModel, TripEventModel
from sqlalchemy import inspect
from sqlalchemy.ext.asyncio import AsyncSession

from commands._commands import Command


class AddTrip(Command):
    def __init__(self, team_jam: TeamJamModel, trip_event: TripEventModel) -> None:
        self.detached_parent: TeamJamModel = team_jam
        self.trip_event: TripEventModel = trip_event

    @override
    async def merge(self, session: AsyncSession) -> None:
        return

    @override
    async def execute(self, session: AsyncSession) -> None:
        if inspect(self.trip_event).detached:
            # Handle redo
            _ = await session.merge(self.trip_event)
        else:
            # Handle initial insertion
            self.detached_parent.events.append(self.trip_event)

    @override
    async def undo(self, session: AsyncSession) -> None:
        trip_event: TripEventModel = await session.merge(self.trip_event)
        await session.delete(trip_event)
        self.trip_event = trip_event


# TODO: DeleteTrip


# TODO: EditTrip
