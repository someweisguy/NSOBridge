from dataclasses import dataclass
from datetime import datetime
from typing import Annotated, override

from fastapi import Body, Depends, Query
from models import AsyncSessionDepends
from models.time import TimeoutModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from commands._commands import Command


async def get_timeout(
    session: AsyncSessionDepends, timeout_id: Annotated[int, Query(alias='timeoutId')]
) -> TimeoutModel:
    statement = select(TimeoutModel).where(TimeoutModel.id == timeout_id)
    results = await session.execute(statement)
    return results.scalar_one()


TimeoutDepends = Annotated[TimeoutModel, Depends(get_timeout)]


@dataclass
class Start(Command):
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
class Stop(Command):
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
