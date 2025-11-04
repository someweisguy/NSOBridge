from dataclasses import dataclass
from datetime import datetime
from typing import Annotated, override

from core.database import ReadOnlyAsyncSessionDepends
from fastapi import Body, Depends, Query
from models import DatabaseCommand, GenericBoutModel, JamModel
from models.time import TimeoutModel
from sqlalchemy import inspect, select


async def get_bout(
    session: ReadOnlyAsyncSessionDepends, bout_id: Annotated[int, Query(alias='boutId')]
) -> GenericBoutModel:
    statement = select(GenericBoutModel).where(GenericBoutModel.id == bout_id)
    results = await session.execute(statement)
    bout: GenericBoutModel = results.scalar_one()
    session.expunge(bout)
    return bout


BoutDepends = Annotated[GenericBoutModel, Depends(get_bout)]


@dataclass
class SetPeriodCountdown(DatabaseCommand):
    detached_bout: BoutDepends
    new_value: Annotated[datetime | None, Body()]
    old_value: Annotated[datetime | None, Body(include_in_schema=False)] = None

    @override
    async def do(self) -> None:
        bout: GenericBoutModel = await self.session.merge(self.detached_bout)
        self.old_value = bout.expected_start_timestamp
        bout.expected_start_timestamp = self.new_value

    @override
    async def undo(self) -> None:
        bout: GenericBoutModel = await self.session.merge(self.detached_bout)
        bout.expected_start_timestamp = self.old_value


@dataclass
class SetIsRunning(DatabaseCommand):
    detached_bout: BoutDepends
    new_value: Annotated[bool, Body()]
    old_value: Annotated[bool, Body(include_in_schema=False)] = False

    @override
    async def do(self) -> None:
        bout: GenericBoutModel = await self.session.merge(self.detached_bout)
        self.old_value = bout.is_running
        bout.is_running = self.new_value

    @override
    async def undo(self) -> None:
        bout: GenericBoutModel = await self.session.merge(self.detached_bout)
        bout.is_running = self.old_value


@dataclass
class SetIsFinal(DatabaseCommand):
    detached_bout: BoutDepends
    new_value: Annotated[bool, Body()]
    old_value: Annotated[bool, Body(include_in_schema=False)] = False

    @override
    async def do(self) -> None:
        bout: GenericBoutModel = await self.session.merge(self.detached_bout)
        self.old_value = bout.is_final
        bout.is_final = self.new_value

    @override
    async def undo(self) -> None:
        bout: GenericBoutModel = await self.session.merge(self.detached_bout)
        bout.is_final = self.old_value


# TODO: class SetOrder(Command)


@dataclass
class AddJam(DatabaseCommand):
    detached_parent: BoutDepends
    jam: JamModel

    @override
    async def do(self) -> None:
        if inspect(self.jam).transient:
            # self.jam.bout_id = self.detached_parent.id
            self.session.add(self.jam)
        else:
            _ = await self.session.merge(self.jam)  # Handle redo
        pass

    @override
    async def undo(self) -> None:
        jam: JamModel = await self.session.merge(self.jam)
        await self.session.delete(jam)
        pass


@dataclass
class AddTimeout(DatabaseCommand):
    detached_parent: BoutDepends
    timeout: TimeoutModel

    @override
    async def do(self) -> None:
        if inspect(self.timeout).transient:
            self.detached_parent.timeouts.append(self.timeout)  # Initial insert
        else:
            _ = await self.session.merge(self.timeout)  # Handle redo

    @override
    async def undo(self) -> None:
        timeout: TimeoutModel = await self.session.merge(self.timeout)
        await self.session.delete(timeout)
        self.timeout = timeout
