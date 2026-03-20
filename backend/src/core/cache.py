"""Handling of client and server caching."""

from __future__ import annotations

from abc import abstractmethod
from copy import deepcopy
from typing import TYPE_CHECKING, override

from sqlalchemy import Result, Select, select

from .database import BaseSQLModel, DatabaseEngine
from .dependencies import EngineFactory
from .protocols import Memento
from .schemas import CacheItemSchema, CacheKey

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
    from sqlalchemy.orm import Session

    from .schemas import ServerSchema


class CacheableSQLModel(BaseSQLModel):
    """A database model which can be cached by clients.

    Cacheable SQL models are the 'primary' models of the database. Clients are able to
    query cacheable models only. Non-cacheable models should not be queried. Cacheable
    models have cache keys which are unique keys used by clients to cache data to
    prevent query duplication.
    """

    __abstract__: bool = True

    def get_memento(self) -> DatabaseMemento:
        """Get a memento of the current state of this model and all its children.

        Returns:
            DatabaseMemento: a Memento of this model's state.

        """
        copy: CacheableSQLModel = deepcopy(self)
        return DatabaseMemento(copy)

    @abstractmethod
    async def cache_key(self) -> CacheKey:
        """Get the cache key of this model.

        Return a unique cache key for this model which can be used by clients to cache
        model data. Cache keys should be serializable by Pydantic and should generally
        not be used in any business logic.

        Returns:
            CacheKey: the unique cache key of this model.

        """
        ...

    @abstractmethod
    def serialize(self) -> ServerSchema:
        """Serialize the model using the model's associated Pydantic schema.

        Returns:
            ServerSchema: the model's associated Pydantic schema.

        """
        ...


class DatabaseMemento(Memento):
    """A Memento sub-class for models in the database."""

    def __init__(self, state: CacheableSQLModel) -> None:
        """Construct a database Memento using the desired model.

        Args:
            state (CacheableSQLModel): the model with which a Memento should be created.

        """
        self._detached_state_to_restore: CacheableSQLModel = state

    @override
    async def restore(self) -> Memento:
        db: DatabaseEngine = EngineFactory.get_default_engine()
        session_factory: async_sessionmaker = db.get_async_session_factory()
        async with session_factory() as session, session.begin():
            # Query and detach the current state of the database object
            table: type[CacheableSQLModel] = self._detached_state_to_restore.__class__
            statement: Select[tuple[CacheableSQLModel]] = select(table).where(
                table.uuid == self._detached_state_to_restore.uuid
            )
            results: Result[tuple[CacheableSQLModel]] = await session.execute(statement)
            current_state: CacheableSQLModel = results.scalar_one()
            session.expunge(current_state)

            # Merge the desired state with the database
            _ = await session.merge(self._detached_state_to_restore)
            await session.commit()

            return current_state.get_memento()


async def get_updated_cache_items(
    session: AsyncSession | Session,
) -> list[CacheItemSchema]:
    """Get a list of the cacheables which have been modified in the desired session.

    Args:
        session (AsyncSession | Session): the session which to check.

    Returns:
        list[CacheItem]: a list of all the cacheable models which have been modified
        and their cache keys.

    """
    # Add each dirty or deleted model to a set for updates
    models: set[BaseSQLModel] = {
        model
        for identity_map in [session.dirty, session.deleted]
        for model in identity_map
        if isinstance(model, BaseSQLModel)
    }

    # Extract the cacheable models from the session
    cacheables: set[CacheableSQLModel] = {
        model for model in models if isinstance(model, CacheableSQLModel)
    }
    for model in models:
        cacheables |= {
            parent
            for parent in await model.get_recursive_parents()
            if isinstance(parent, CacheableSQLModel)
        }

    items = [
        CacheItemSchema(key=await cacheable.cache_key(), data=cacheable.serialize())
        for cacheable in cacheables
    ]
    return items
