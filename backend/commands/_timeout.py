from dataclasses import dataclass
from datetime import datetime
from typing import TYPE_CHECKING, Annotated, override

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
