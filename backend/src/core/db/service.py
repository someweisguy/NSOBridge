"""Handling of client and server caching."""

from __future__ import annotations

from abc import abstractmethod
from copy import deepcopy
from typing import TYPE_CHECKING, Final, override

from sqlalchemy import URL, Result, Select, select
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker

import core.ws
from core.users import Memento

from .models import BaseSQLModel

if TYPE_CHECKING:
    from pathlib import Path

    from sqlalchemy.orm import Session

    from core.app import ServerSchema

    from .types import CacheKey

session_factory: Final[async_sessionmaker[AsyncSession]] = async_sessionmaker[
    AsyncSession
](expire_on_commit=False)


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
            models: list[CacheableSQLModel] = get_mutated_cache_models(session)

            await session.commit()

        if len(models) > 0:
            await invalidate_cached_models(models)

        return current_state.get_memento()


class CacheableSQLModel(BaseSQLModel):
    """A database model which can be cached by clients.

    Cacheable SQL models are the 'primary' models of the database. Clients are able to
    query cacheable models only. Non-cacheable models should not be queried. Cacheable
    models have cache keys which are unique keys used by clients to cache data to
    prevent query duplication.
    """

    __abstract__: bool = True

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


def get_mutated_cache_models(
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
            for parent in model.get_recursive_parents()
            if isinstance(parent, CacheableSQLModel)
        }

    return list(cacheables)


async def invalidate_cached_models(models: list[CacheableSQLModel]) -> None:
    """Invalidate the specified cached models.

    This informs all clients that the keys of the specified models have been updated
    and must be queried again.

    Args:
        models (list[CacheableSQLModel]): a list of models to be invalidated.

    """
    await core.ws.send_all('cache', [model.cache_key() for model in models])


def get_database_url(file_path: str | Path) -> URL:
    """Get a URL to a database.

    Args:
        file_path (str | Path): the path to the database.

    Returns:
        URL: A formatted URL for the SQLAlchemy database.

    """
    return URL.create('sqlite+aiosqlite', database=str(file_path))


async def create_tables(engine: AsyncEngine) -> None:
    """Create the database tables for a file.

    Args:
        engine (AsyncEngine): The async engine used to connect to the file.

    """
    async with engine.begin() as connection:
        await connection.run_sync(BaseSQLModel.metadata.create_all)
