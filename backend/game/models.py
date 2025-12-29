from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timedelta
from typing import TYPE_CHECKING, Annotated, Any, Protocol, override

from core import BaseSQLModel, db
from sqlalchemy import CheckConstraint, Constraint, Result, Select, select
from sqlalchemy.orm import Mapped, mapped_column

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import async_sessionmaker


type CacheKey = Annotated[
    tuple[Any, ...], 'The type of the cache key used by cacheable models.'
]


class Memento(Protocol):
    """Represent a memento point-in-time of the application state.

    Mementos can be used to implement functionality such as undo and redo by restoring
    the application to a previous state.
    """

    async def restore(self) -> Memento:
        """Restore the state of the application to when this Memento was constructed.

        Returns:
            Memento: A Memento of the state of the application before this method was
            called. Calling `restore()` on this newly created Memento has the effect of
            redoing an operation.

        """
        ...


class CacheableSQLModel(BaseSQLModel):
    """A database model which can be cached by clients.

    Cacheable SQL models are the 'primary' models of the database. Clients are able to
    query cacheable models only. Non-cacheable models should not be queried. Cacheable
    models have cache keys which are unique keys used by clients to cache data to
    prevent query duplication.
    """

    __abstract__: bool = True

    def cache_key(self) -> CacheKey:
        """Get the cache key of this model.

        Return a unique cache key for this model which can be used by clients to cache
        model data.

        Returns:
            CacheKey: the unique cache key of this model.

        """
        ...

    def get_snapshot(self) -> DatabaseMemento:
        copy: CacheableSQLModel = deepcopy(self)
        return DatabaseMemento(copy)


class AbstractOneShotModel(BaseSQLModel):
    """The abstract base class for one-shot models.

    One-shot models are models which can be started and stopped only once. Once a
    one-shot is stopped, a new one-shot must be instantiated and started. An example of
    this would be a Jam or a Timeout. Once the Jam ends, it is permanently over. The
    Period Clock, on the other hand, can be started and stopped multiple times.
    """

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


class DatabaseMemento(Memento):
    def __init__(self, state: CacheableSQLModel) -> None:
        self._detached_state_to_restore: CacheableSQLModel = state

    @override
    async def restore(self) -> Memento:
        session_factory: async_sessionmaker = db.get_async_session_factory()
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
