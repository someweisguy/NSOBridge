from dataclasses import dataclass
from datetime import datetime
from typing import TYPE_CHECKING, Annotated, override

from core.database import ReadOnlyAsyncSessionDepends
from fastapi import Body, Depends, Query
from models import DatabaseCommand, JamModel, TeamName
from models.jam import TeamJamModel, TripEventModel
from sqlalchemy import inspect, select
from sqlalchemy.ext.asyncio import AsyncSession

if TYPE_CHECKING:
    from sqlalchemy.engine.result import Result


async def get_jam(
    session: ReadOnlyAsyncSessionDepends,
    bout_id: Annotated[int, Query(alias='boutId')],
    period_num: Annotated[int, Query(alias='periodNum')],
    jam_num: Annotated[int, Query(alias='jamNum')],
) -> JamModel:
    statement = select(JamModel).where(
        JamModel.bout_id == bout_id
        and JamModel.period == period_num
        and JamModel.jam == jam_num
    )
    results: Result[tuple[JamModel]] = await session.execute(statement)
    return results.scalar_one()


JamDepends = Annotated[JamModel, Depends(get_jam)]


async def get_team_jam(
    jam: JamDepends, team: Annotated[TeamName, Query()]
) -> TeamJamModel:
    return jam[team]


TeamJamDepends = Annotated[TeamJamModel, Depends(get_team_jam)]


@dataclass
class JamStart(DatabaseCommand):
    detached_jam: JamDepends
    timestamp: Annotated[datetime, Body()]

    @override
    async def execute(self, session: AsyncSession) -> None:
        jam: JamModel = await session.merge(self.detached_jam)
        jam.start(self.timestamp)

    @override
    async def undo(self, session: AsyncSession) -> None:
        jam: JamModel = await session.merge(self.detached_jam)
        jam.start_timestamp = None


@dataclass
class JamStop(DatabaseCommand):
    detached_jam: JamDepends
    timestamp: Annotated[datetime, Body()]

    @override
    async def execute(self, session: AsyncSession) -> None:
        jam: JamModel = await session.merge(self.detached_jam)
        jam.stop(self.timestamp)

    @override
    async def undo(self, session: AsyncSession) -> None:
        jam: JamModel = await session.merge(self.detached_jam)
        jam.stop_timestamp = None


@dataclass
class AddTrip(DatabaseCommand):
    detached_team_jam: TeamJamDepends
    trip_event: TripEventModel

    @override
    async def do(self) -> None:
        if inspect(self.trip_event).transient:
            self.detached_team_jam.events.append(self.trip_event)
        else:
            _ = await self.session.merge(self.trip_event)

    @override
    async def undo(self) -> None:
        trip_event: TripEventModel = await self.session.merge(self.trip_event)
        await self.session.delete(trip_event)
        self.trip_event = trip_event


# TODO: DeleteTrip
