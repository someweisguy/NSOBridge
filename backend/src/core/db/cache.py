"""Handling of client and server caching."""

from __future__ import annotations

from abc import abstractmethod
from copy import deepcopy
from typing import TYPE_CHECKING, override

from sqlalchemy import Result, Select, select

from core import CacheItemSchema, Memento, invalidate_queries

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
    from sqlalchemy.orm import Session

    from core import CacheKey, ServerSchema

from .engine import DatabaseEngine
from .model import BaseSQLModel


class CacheableSQLModel(BaseSQLModel):
    """A database model which can be cached by clients.

    Cacheable SQL models are the 'primary' models of the database. Clients are able to
    query cacheable models only. Non-cacheable models should not be queried. Cacheable
    models have cache keys which are unique keys used by clients to cache data to
    prevent query duplication.
    """

    __abstract__: bool = True

    async def get_updates(self) -> list[CacheItemSchema]:
        """Get the updates from the session that this model is in.

        Returns:
            list[CacheItemSchema]: a mapping of cache keys to their model data.

        """
        session: AsyncSession = self.get_session()
        models: list[CacheableSQLModel] = await get_mutated_cache_models(session)
        return [
            CacheItemSchema(key=model.cache_key(), data=model.serialize())
            for model in models
        ]

    def get_memento(self) -> Memento:
        """Get a memento of the current state of this model and all its children.

        Returns:
            DatabaseMemento: a Memento of this model's state.

        """
        copy: CacheableSQLModel = deepcopy(self)
        return _DatabaseMemento(copy)

    @abstractmethod
    def cache_key(self) -> CacheKey:
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


class _DatabaseMemento(Memento):
    """A Memento sub-class for models in the database."""

    def __init__(self, state: CacheableSQLModel) -> None:
        """Construct a database Memento using the desired model.

        Args:
            state (CacheableSQLModel): the model with which a Memento should be created.

        """
        self._detached_state_to_restore: CacheableSQLModel = state

    @override
    async def restore(self) -> Memento:
        session_factory: async_sessionmaker = (
            DatabaseEngine.get_engine().get_async_session_factory()
        )
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

            # Get a list of query keys to invalidate before committing the session
            models: list[CacheableSQLModel] = await get_mutated_cache_models(session)
            query_keys: list[CacheKey] = [model.cache_key() for model in models]

            await session.commit()

        if len(query_keys) > 0:
            await invalidate_queries(query_keys)

        return current_state.get_memento()


async def get_mutated_cache_models(
    session: AsyncSession | Session,
) -> list[CacheableSQLModel]:
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
        for identity_map in [session.dirty]
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

    return list(cacheables)
