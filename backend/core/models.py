"""Base models for use in the other modules."""

from __future__ import annotations

import os
from datetime import timedelta
from typing import TYPE_CHECKING, Final, final

from sqlalchemy import inspect
from sqlalchemy.ext.asyncio import AsyncAttrs, async_sessionmaker, create_async_engine
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
        cacheables: set[BaseSQLModel] = set()
        for parent in self._get_parents():
            cacheables.add(parent)
            cacheables |= parent.search_parents()
        return cacheables


class Database:
    _name: str = ':memory:'
    _session_factories: dict[str, async_sessionmaker] = {}

    @classmethod
    async def get_file_name(cls) -> str:
        return cls._name

    @classmethod
    async def set_file_name(cls, name: str) -> None:
        cls._name = name

    @classmethod
    async def get_async_session_factory(cls, name: str = '') -> async_sessionmaker:
        session_factory: async_sessionmaker | None = cls._session_factories.get(
            name, None
        )
        if session_factory is None:
            if name != '':
                pass  # TODO: ensure that `name` is a legal filename
            engine: AsyncEngine = create_async_engine(
                _DB_PREFIX + (f'{name}' if name != '' else cls._name),
                echo=_DEBUG,
            )
            session_factory = async_sessionmaker(
                bind=engine,
                expire_on_commit=False,
            )
            async with engine.connect() as session:
                await session.run_sync(BaseSQLModel.metadata.create_all)
            cls._session_factories[name] = session_factory

        return session_factory
