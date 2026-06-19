"""Base models for use in the other modules."""

from __future__ import annotations

from abc import abstractmethod
from copy import deepcopy
from datetime import timedelta
from math import floor
from typing import TYPE_CHECKING, Any, override
from uuid import UUID, uuid4

from sqlalchemy import Result, Select, select
from sqlalchemy.ext.asyncio import AsyncAttrs, AsyncSession, async_object_session
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.types import Integer, TypeDecorator, TypeEngine

from core import CacheItemSchema, Memento

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

    from core import ServerSchema

    from .types import CacheKey


from .engine import DatabaseEngine
from .service import get_mutated_cache_models, invalidate_cached_models

if TYPE_CHECKING:
    from sqlalchemy import Dialect
    from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker


class _TimedeltaAsMilliseconds(TypeDecorator[Integer]):
    """Converts integer number of milliseconds to a Python timedelta object.

    This class is used for converting values to and from the model database.
    """

    impl: TypeEngine[Any] | type[TypeEngine[Any]] = Integer
    cache_ok: bool | None = True

    @override
    def process_bind_param(self, value: Any | None, dialect: Dialect) -> Any:
        if value is not None:
            if not isinstance(value, timedelta):
                raise TypeError()
            return floor(value.total_seconds() * 1000)
        return value

    @override
    def process_result_value(self, value: Any | None, dialect: Dialect) -> Any | None:
        if not isinstance(value, (float, int)):
            raise TypeError()
        return timedelta(milliseconds=value)


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

            await session.commit()

        if len(models) > 0:
            await invalidate_cached_models(models)

        return current_state.get_memento()


class BaseSQLModel(DeclarativeBase, AsyncAttrs):
    """The base model for all models in the database.

    This model has a standard SQL `id` field. It also includes a type annotation map to
    convert Python timedelta objects to an integer number of milliseconds.

    """

    uuid: Mapped[UUID] = mapped_column(default=uuid4, primary_key=True)

    __abstract__: bool = True
    __type_annotation_map__: dict = {timedelta: _TimedeltaAsMilliseconds}

    async def get_parents(self) -> tuple[BaseSQLModel, ...]:
        """Asynchronously get a tuple of this model's direct parents.

        Returns:
            tuple[BaseSQLModel]: the immediate parents of this model.

        """
        raise NotImplementedError('get_parents() is not implemented in this model')

    async def get_recursive_parents(self) -> tuple[BaseSQLModel, ...]:
        """Recursively and asynchronously get a tuple of this model's parents.

        This method is used to get the hierarchical branch of models that this model
        is on. This is useful to ensure that clients can refresh objects that have
        updated.

        Returns:
            tuple[BaseSQLModel]: the recursive parents of this model.

        """
        recursive_parents: list[BaseSQLModel] = list(await self.get_parents())
        for parent in await self.get_parents():
            if isinstance(parent, BaseSQLModel):
                recursive_parents.extend(await parent.get_recursive_parents())
        return tuple(recursive_parents)

    def get_session(self) -> AsyncSession:
        """Get the session from the SQLAlchemy object.

        Raises:
            TypeError: if this object is not associated with a SQLAlchemy session.

        Returns:
            AsyncSession: the session with which this object is associated.

        """
        session: AsyncSession | None = async_object_session(self)
        if session is None:
            raise TypeError('This object is not associated with a SQL session')
        return session


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
