"""Base models for use in the other modules."""

from __future__ import annotations

import os
from datetime import timedelta
from typing import TYPE_CHECKING, ClassVar, Final, final

from sqlalchemy import inspect
from sqlalchemy.engine import URL
from sqlalchemy.ext.asyncio import (
    AsyncAttrs,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import CascadeOptions, DeclarativeBase, Mapped, mapped_column

from .utils import _TimedeltaAsMilliseconds

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio.engine import AsyncEngine


_DB_PREFIX: Final[str] = 'sqlite+aiosqlite:///' + ''
_DEBUG: bool = os.environ.get('SQLALCHEMY_DEBUG', '').lower() in {'true', 'yes'}

CHILD_RELATIONSHIP: Final[str] = 'all, delete-orphan'
PARENT_RELATIONSHIP: Final[str] = 'expunge, save-update'


class BaseSQLModel(AsyncAttrs, DeclarativeBase):
    """The base model for all models in the database.

    This model has a standard SQL `id` field. It also includes a type annotation map to
    convert Python timedelta objects to an integer number of milliseconds.

    """

    id: Mapped[int | None] = mapped_column(nullable=False, primary_key=True)

    __abstract__: bool = True
    __type_annotation_map__: dict = {timedelta: _TimedeltaAsMilliseconds}

    def _get_parents(self) -> list[BaseSQLModel]:
        parents: list[BaseSQLModel] = []
        for name, mapper in inspect(self).mapper.relationships.items():
            if mapper.cascade == CascadeOptions(PARENT_RELATIONSHIP):
                parent: BaseSQLModel | None = getattr(self, name)
                if parent is not None:
                    parents.append(parent)
        return parents

    @final
    def search_parents(self) -> set[BaseSQLModel]:
        """Recursively get a set of this model's parents.

        This method is used to get the hierarchical branch of models that this model
        is on. This is useful to ensure that clients can update objects that may have
        updated.

        Returns:
            set[BaseSQLModel]: all of the parents of this model, up to the root model.

        """
        models: set[BaseSQLModel] = set()
        for parent in self._get_parents():
            models.add(parent)
            models |= parent.search_parents()
        return models


class EngineManager:
    _DRIVER: ClassVar[Final[str]] = 'sqlite+aiosqlite:///'

    def __init__(self, db_schema: type[DeclarativeBase], db_path: str = '') -> None:
        # TODO: ensure that path is a legal file name
        if not db_path.isprintable():
            raise ValueError('db path is invalid')
        self._db_schema: type[DeclarativeBase] = db_schema
        self._session_factory: async_sessionmaker | None = None
        self.path: Final[str] = db_path if db_path != '' else ':memory:'

    async def create_all(self) -> None:
        if self._session_factory is not None:
            raise RuntimeError('the database has already been created')

        # Initialize the database engine
        url: URL = URL.create(self._DRIVER, database=self.path)
        engine: AsyncEngine = create_async_engine(url, echo=False)
        self._session_factory = async_sessionmaker(bind=engine, expire_on_commit=False)

        # Create the database tables
        async with engine.connect() as session:
            await session.run_sync(self._db_schema.metadata.create_all)

    def get_async_session_factory(self) -> async_sessionmaker:
        if self._session_factory is None:
            raise RuntimeError('the database has not been created yet')
        return self._session_factory

    def get_async_session(self) -> AsyncSession:
        factory: async_sessionmaker = self.get_async_session_factory()
        return factory()
