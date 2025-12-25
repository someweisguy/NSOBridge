from __future__ import annotations

import os
from copy import deepcopy
from datetime import timedelta
from math import floor
from typing import (
    TYPE_CHECKING,
    Any,
    Final,
    LiteralString,
    Protocol,
    final,
    override,
)

from sqlalchemy import Result, Select, inspect, select
from sqlalchemy.engine.base import Connection, Engine
from sqlalchemy.ext.asyncio import (
    AsyncAttrs,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import (
    CascadeOptions,
    DeclarativeBase,
    Mapped,
    mapped_column,
)
from sqlalchemy.sql.schema import Sequence
from sqlalchemy.types import Integer, TypeDecorator, TypeEngine

if TYPE_CHECKING:
    from sqlalchemy import Dialect
    from sqlalchemy.ext.asyncio import AsyncSession
    from sqlalchemy.ext.asyncio.engine import AsyncEngine


type CacheKey = tuple[str, Sequence[int | float | str | bool, ...], dict[str, Any]]

CHILD_RELATIONSHIP: Final[str] = 'all, delete-orphan'
PARENT_RELATIONSHIP: Final[str] = 'expunge, save-update'

DB_PREFIX: LiteralString = 'sqlite+aiosqlite:///' + ''
DATABASE: Final[str] = os.environ.get('DB_PATH', ':memory:')
DEBUG: Final[bool] = os.environ.get('SQLALCHEMY_DEBUG', 'false').lower() in {
    'true',
    'yes',
}


class _TimedeltaAsMilliseconds(TypeDecorator[Integer]):
    impl: TypeEngine[Any] | type[TypeEngine[Any]] = Integer
    cache_ok: bool | None = True

    @override
    def process_bind_param(self, value: Any | None, dialect: Dialect) -> Any:
        if value is not None:
            assert isinstance(value, timedelta)
            return floor(value.total_seconds() * 1000)
        return value

    @override
    def process_result_value(self, value: Any | None, dialect: Dialect) -> Any | None:
        assert isinstance(value, (float, int))
        return timedelta(milliseconds=value)


class BaseSQLModel(AsyncAttrs, DeclarativeBase):
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


class CacheableSQLModel(BaseSQLModel):
    __abstract__: bool = True

    def cache_key(self) -> CacheKey: ...

    def get_snapshot(self, session: AsyncSession) -> DatabaseMemento:
        copy: CacheableSQLModel = deepcopy(self)
        return DatabaseMemento(copy, session)


class Memento(Protocol):
    async def restore(self) -> Memento: ...


class DatabaseMemento(Memento):
    def __init__(self, state: CacheableSQLModel, session: AsyncSession) -> None:
        self._detached_state_to_restore: CacheableSQLModel = state
        connection: Connection | Engine = session.get_bind()
        if isinstance(connection, Connection):
            connection = connection.engine
        self._factory_name: str = str(connection.url)

    @override
    async def restore(self) -> Memento:
        session_factory: async_sessionmaker = await Database.get_async_session_factory(
            self._factory_name
        )
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

            return current_state.get_snapshot(session)


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
                DB_PREFIX + (f'{name}' if name != '' else cls._name),
                echo=DEBUG,
            )
            session_factory = async_sessionmaker(
                bind=engine,
                expire_on_commit=False,
            )
            async with engine.connect() as session:
                await session.run_sync(BaseSQLModel.metadata.create_all)
            cls._session_factories[name] = session_factory

        return session_factory
