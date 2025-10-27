from datetime import datetime
from typing import override

from models import JamModel
from models.jam import TeamJamModel, TripEventModel
from sqlalchemy import inspect
from sqlalchemy.ext.asyncio import AsyncSession

from commands._commands import Command


class JamStart(Command):
    def __init__(self, jam: JamModel, timestamp: datetime) -> None:
        self.timestamp: datetime = timestamp
        self.jam: JamModel = jam

    @override
    async def execute(self, session: AsyncSession) -> None:
        self.jam.start(self.timestamp)

    @override
    async def undo(self, session: AsyncSession) -> None:
        self.jam.start_timestamp = None


class JamStop(Command):
    def __init__(self, jam: JamModel, timestamp: datetime) -> None:
        self.timestamp: datetime = timestamp
        self.jam: JamModel = jam

    @override
    async def execute(self, session: AsyncSession) -> None:
        self.jam.stop(self.timestamp)

    @override
    async def undo(self, session: AsyncSession) -> None:
        self.jam.stop_timestamp = None


class AddTrip(Command):
    def __init__(self, team_jam: TeamJamModel, trip_event: TripEventModel) -> None:
        self.detached_parent: TeamJamModel = team_jam
        self.trip_event: TripEventModel = trip_event

    @override
    async def execute(self, session: AsyncSession) -> None:
        if inspect(self.trip_event).transient:
            self.detached_parent.events.append(self.trip_event)
        else:
            _ = await session.merge(self.trip_event)

    @override
    async def undo(self, session: AsyncSession) -> None:
        trip_event: TripEventModel = await session.merge(self.trip_event)
        await session.delete(trip_event)
        self.trip_event = trip_event


# TODO: DeleteTrip
