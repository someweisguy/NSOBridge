from datetime import datetime
from typing import override

from models import GenericBoutModel, JamModel
from models.jam import TeamJamModel, TripEventModel
from sqlalchemy import inspect
from sqlalchemy.ext.asyncio import AsyncSession

from commands._commands import Command


class JamAdd(Command):
    def __init__(self, bout: GenericBoutModel, jam: JamModel) -> None:
        self.detached_parent: GenericBoutModel = bout
        self.jam: JamModel = jam

    @override
    async def merge(self, session: AsyncSession) -> None:
        return

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
