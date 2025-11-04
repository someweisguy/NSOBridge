from dataclasses import dataclass
from datetime import datetime
from typing import Annotated, override

from core.database import ReadOnlyAsyncSessionDepends
from fastapi import Body, Depends, Query
from models import DatabaseCommand
from models.time import TimeoutModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


async def get_timeout(
    session: ReadOnlyAsyncSessionDepends,
    timeout_id: Annotated[int, Query(alias='timeoutId')],
) -> TimeoutModel:
    statement = select(TimeoutModel).where(TimeoutModel.id == timeout_id)
    results = await session.execute(statement)
    return results.scalar_one()


TimeoutDepends = Annotated[TimeoutModel, Depends(get_timeout)]


@dataclass
class Start(DatabaseCommand):
    detached_timeout: TimeoutDepends
    timestamp: Annotated[datetime, Body()]

    @override
    async def execute(self, session: AsyncSession) -> None:
        timeout: TimeoutModel = await session.merge(self.detached_timeout)
        timeout.start(self.timestamp)

    @override
    async def undo(self, session: AsyncSession) -> None:
        timeout: TimeoutModel = await session.merge(self.detached_timeout)
        timeout.start_timestamp = None


@dataclass
class Stop(DatabaseCommand):
    detached_timeout: TimeoutDepends
    timestamp: Annotated[datetime, Body()]

    @override
    async def execute(self, session: AsyncSession) -> None:
        timeout: TimeoutModel = await session.merge(self.detached_timeout)
        timeout.stop(self.timestamp)

    @override
    async def undo(self, session: AsyncSession) -> None:
        timeout: TimeoutModel = await session.merge(self.detached_timeout)
        timeout.stop_timestamp = None
