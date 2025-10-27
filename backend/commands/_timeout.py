from dataclasses import dataclass
from datetime import datetime
from typing import TYPE_CHECKING, Annotated, override

from models.jam import TeamJamModel, TripEventModel
from models.time import TimeoutModel
from sqlalchemy import inspect, select
from sqlalchemy.ext.asyncio import AsyncSession

from commands._commands import Command

if TYPE_CHECKING:
    from sqlalchemy.engine.result import Result


# TODO: get_timeout


@dataclass
class TimeoutStart(Command):
    detached_timeout: TimeoutModel
    timestamp: datetime

    @override
    async def execute(self, session: AsyncSession) -> None:
        timeout: TimeoutModel = await session.merge(self.detached_timeout)
        timeout.start(self.timestamp)

    @override
    async def undo(self, session: AsyncSession) -> None:
        timeout: TimeoutModel = await session.merge(self.detached_timeout)
        timeout.start_timestamp = None


@dataclass
class TimeoutStop(Command):
    detached_timeout: TimeoutModel
    timestamp: datetime

    @override
    async def execute(self, session: AsyncSession) -> None:
        timeout: TimeoutModel = await session.merge(self.detached_timeout)
        timeout.stop(self.timestamp)

    @override
    async def undo(self, session: AsyncSession) -> None:
        timeout: TimeoutModel = await session.merge(self.detached_timeout)
        timeout.stop_timestamp = None


@dataclass
class AddTrip(Command):
    detached_parent: TeamJamModel
    trip_event: TripEventModel

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
