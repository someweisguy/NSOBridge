from dataclasses import dataclass
from datetime import datetime
from typing import Annotated, override

from core import Command
from core.database import AsyncSessionDepends
from fastapi import Body, Depends, Query
from models import GenericBoutModel, JamModel
from models.time import TimeoutModel
from sqlalchemy import inspect, select
from sqlalchemy.ext.asyncio import AsyncSession


async def get_bout(
    session: AsyncSessionDepends, bout_id: Annotated[int, Query(alias='boutId')]
) -> GenericBoutModel:
    statement = select(GenericBoutModel).where(GenericBoutModel.id == bout_id)
    results = await session.execute(statement)
    return results.scalar_one()


BoutDepends = Annotated[GenericBoutModel, Depends(get_bout)]


@dataclass
class SetPeriodCountdown(Command):
    detached_bout: BoutDepends
    new_value: Annotated[datetime | None, Body()]
    old_value: Annotated[datetime | None, Body(include_in_schema=False)] = None

    @override
    async def execute(self, session: AsyncSession) -> None:
        bout: GenericBoutModel = await session.merge(self.detached_bout)
        self.old_value = bout.expected_start_timestamp
        bout.expected_start_timestamp = self.new_value

    @override
    async def undo(self, session: AsyncSession) -> None:
        bout: GenericBoutModel = await session.merge(self.detached_bout)
        bout.expected_start_timestamp = self.old_value


@dataclass
class SetIsRunning(Command):
    detached_bout: BoutDepends
    new_value: Annotated[bool, Body()]
    old_value: Annotated[bool, Body(include_in_schema=False)] = False

    @override
    async def execute(self, session: AsyncSession) -> None:
        bout: GenericBoutModel = await session.merge(self.detached_bout)
        self.old_value = bout.is_running
        bout.is_running = self.new_value

    @override
    async def undo(self, session: AsyncSession) -> None:
        bout: GenericBoutModel = await session.merge(self.detached_bout)
        bout.is_running = self.old_value


@dataclass
class SetIsFinal(Command):
    detached_bout: BoutDepends
    new_value: Annotated[bool, Body()]
    old_value: Annotated[bool, Body(include_in_schema=False)] = False

    @override
    async def execute(self, session: AsyncSession) -> None:
        bout: GenericBoutModel = await session.merge(self.detached_bout)
        self.old_value = bout.is_final
        bout.is_final = self.new_value

    @override
    async def undo(self, session: AsyncSession) -> None:
        bout: GenericBoutModel = await session.merge(self.detached_bout)
        bout.is_final = self.old_value


# TODO: class SetOrder(Command)


@dataclass
class AddJam(Command):
    detached_parent: BoutDepends
    jam: JamModel

    @override
    async def execute(self, session: AsyncSession) -> None:
        if inspect(self.jam).transient:
            self.detached_parent.jams.append(self.jam)  # Initial insert
        else:
            _ = await session.merge(self.jam)  # Handle redo

    @override
    async def undo(self, session: AsyncSession) -> None:
        jam: JamModel = await session.merge(self.jam)
        await session.delete(jam)
        self.jam = jam


@dataclass
class AddTimeout(Command):
    detached_parent: BoutDepends
    timeout: TimeoutModel

    @override
    async def execute(self, session: AsyncSession) -> None:
        if inspect(self.timeout).transient:
            self.detached_parent.timeouts.append(self.timeout)  # Initial insert
        else:
            _ = await session.merge(self.timeout)  # Handle redo

    @override
    async def undo(self, session: AsyncSession) -> None:
        timeout: TimeoutModel = await session.merge(self.timeout)
        await session.delete(timeout)
        self.timeout = timeout
