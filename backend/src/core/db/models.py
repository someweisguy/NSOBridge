"""Base models for use in the other modules."""

from __future__ import annotations

from abc import abstractmethod
from datetime import timedelta
from math import floor
from typing import TYPE_CHECKING, Any, override
from uuid import UUID  # noqa: TC003 - Make SQLAlchemy happy.

from sqlalchemy.ext.asyncio import AsyncAttrs, AsyncSession, async_object_session
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.types import Integer, TypeDecorator, TypeEngine

if TYPE_CHECKING:
    from sqlalchemy import Dialect
    from sqlalchemy.ext.asyncio import AsyncSession

    from core.app import CacheKey


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


class BaseSQLModel(DeclarativeBase, AsyncAttrs):
    """The base model for all models in the database.

    This model has a standard SQL `id` field. It also includes a type annotation map to
    convert Python timedelta objects to an integer number of milliseconds.

    """

    # TODO: type should be Mapped[UUID | None]
    uuid: Mapped[UUID] = mapped_column(primary_key=True, nullable=False)
    """The model's UUID; its primary key."""

    __abstract__: bool = True
    __type_annotation_map__: dict = {timedelta: _TimedeltaAsMilliseconds}

    def __eq__(self, other: object) -> bool:
        """Compare this object for equality.

        Args:
            other (Any): the other object.

        Returns:
            bool: True if the two objects are equal.

        """
        return isinstance(other, BaseSQLModel) and other.uuid == self.uuid

    def __hash__(self) -> int:
        """Get a hash of this object.

        Returns:
            int: this object's hash.

        """
        if isinstance(self.uuid, list):
            return hash(self.uuid[0])
        else:
            return hash(self.uuid)

    def get_parents(self) -> tuple[BaseSQLModel, ...]:
        """Asynchronously get a tuple of this model's direct parents.

        Returns:
            tuple[BaseSQLModel]: the immediate parents of this model.

        """
        raise NotImplementedError('get_parents() is not implemented in this model')

    def get_recursive_parents(self) -> tuple[BaseSQLModel, ...]:
        """Recursively and asynchronously get a tuple of this model's parents.

        This method is used to get the hierarchical branch of models that this model
        is on. This is useful to ensure that clients can refresh objects that have
        updated.

        Returns:
            tuple[BaseSQLModel]: the recursive parents of this model.

        """
        recursive_parents: list[BaseSQLModel] = list(self.get_parents())
        for parent in self.get_parents():
            if isinstance(parent, BaseSQLModel):
                recursive_parents.extend(parent.get_recursive_parents())
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
