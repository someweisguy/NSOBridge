from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timedelta
from typing import TYPE_CHECKING, Any, Protocol, override

from core.models import BaseSQLModel, Database
from sqlalchemy import CheckConstraint, Constraint, Result, Select, select
from sqlalchemy.orm import Mapped, mapped_column

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import async_sessionmaker


type CacheKey = tuple[Any, ...]


class AbstractOneShotModel(BaseSQLModel):
    start_timestamp: Mapped[datetime | None] = mapped_column(default=None)
    stop_timestamp: Mapped[datetime | None] = mapped_column(default=None)

    __abstract__: bool = True

    __table_args__: tuple[Constraint, ...] = (
        CheckConstraint('start_timestamp < stop_timestamp'),
        CheckConstraint('start_timestamp IS NOT NULL OR stop_timestamp IS NULL'),
    )

    def start(self, timestamp: datetime) -> None:
        if self.is_running():
            raise RuntimeError('Cannot start a Clock when it is already running')
        self.start_timestamp = timestamp

    def stop(self, timestamp: datetime) -> None:
        if not self.is_running():
            raise RuntimeError('Cannot stop a Clock when it is already stopped')
        assert self.start_timestamp is not None
        if timestamp < self.start_timestamp:
            raise RuntimeError('Cannot stop a Clock before it has been started')
        self.stop_timestamp = timestamp

    def is_started(self) -> bool:
        return self.start_timestamp is not None

    def is_running(self) -> bool:
        return self.is_started() and not self.is_finished()

    def is_finished(self) -> bool:
        return self.stop_timestamp is not None

    def get_duration(self, timestamp: datetime | None = None) -> timedelta:
        if timestamp is None:
            timestamp = datetime.now()
        if self.start_timestamp is None:
            return timedelta(seconds=0)
        elif self.stop_timestamp is not None:
            return self.stop_timestamp - self.start_timestamp
        else:
            if timestamp < self.start_timestamp:
                raise ValueError('Cannot get a duration for a time that is in the past')
            return timestamp - self.start_timestamp


class CacheableSQLModel(BaseSQLModel):
    __abstract__: bool = True

    def cache_key(self) -> CacheKey: ...

    def get_snapshot(self) -> DatabaseMemento:
        copy: CacheableSQLModel = deepcopy(self)
        return DatabaseMemento(copy)


class Memento(Protocol):
    async def restore(self) -> Memento: ...


class DatabaseMemento(Memento):
    def __init__(self, state: CacheableSQLModel) -> None:
        self._detached_state_to_restore: CacheableSQLModel = state

    @override
    async def restore(self) -> Memento:
        session_factory: async_sessionmaker = await Database.get_async_session_factory()
        async with session_factory() as session, session.begin():
            # Query and detach the current state of the database object
            Table: type[CacheableSQLModel] = self._detached_state_to_restore.__class__
            statement: Select[tuple[CacheableSQLModel]] = (
                select(Table)
                .where(Table.id == self._detached_state_to_restore.id)
                .limit(1)
            )
            results: Result[tuple[CacheableSQLModel]] = await session.execute(statement)
            current_state: CacheableSQLModel = results.scalar_one()
            session.expunge(current_state)

            # Merge the desired state with the database
            _ = await session.merge(self._detached_state_to_restore)
            await session.commit()

            return current_state.get_snapshot()
