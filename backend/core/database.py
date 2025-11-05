from __future__ import annotations

import os
from copy import deepcopy
from datetime import timedelta
from math import floor
from typing import TYPE_CHECKING, Annotated, Any, TypeAlias, override

from fastapi import Depends
from sqlalchemy import Result, Select, inspect, select
from sqlalchemy.ext.asyncio import (
    AsyncAttrs,
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
)
from sqlalchemy.types import Integer, TypeDecorator, TypeEngine

from core.history import Memento

if TYPE_CHECKING:
    from collections.abc import AsyncGenerator

    from sqlalchemy import Dialect

DATABASE: str = os.environ.get('DB_PATH', ':memory:')
DEBUG: bool = os.environ.get('SQLALCHEMY_DEBUG', 'false').lower() in {'true', 'yes'}

engine: AsyncEngine = create_async_engine(f'sqlite+aiosqlite:///{DATABASE}', echo=DEBUG)
SessionLocal: async_sessionmaker[AsyncSession] = async_sessionmaker(
    bind=engine, expire_on_commit=False
)


class TimedeltaAsMilliseconds(TypeDecorator[Integer]):
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


class SQLModel(AsyncAttrs, DeclarativeBase):
    __abstract__: bool = True

    id: Mapped[int | None] = mapped_column(nullable=False, primary_key=True)

    @property
    def parents(self) -> tuple[SQLModel | None, ...]: ...

    def search_parents(self) -> set[SQLModel]:
        cacheables: set[SQLModel] = set()
        for parent in self.parents:
            if parent is None:
                continue  # TODO: log a warning of improper use of this function
            cacheables.add(parent)
            cacheables |= parent.search_parents()
        return cacheables


async def setup() -> None:
    async with engine.connect() as connection:
        await connection.run_sync(SQLModel.metadata.create_all)
    # Create a Bout model if one does not already exist
    from models.bout import GenericBoutModel
    from models.rulesets.wftda_2025 import BoutModel
    from models.series import SeriesModel
    from models.team import RosterModel

    bout: GenericBoutModel | None = None
    async with SessionLocal() as session, session.begin():
        statement: Select[tuple[GenericBoutModel]] = select(GenericBoutModel)
        results: Result[tuple[GenericBoutModel]] = await session.execute(statement)
        if results.scalar() is None:
            print('Creating initial Bout model')
            bout = BoutModel(
                SeriesModel(),
                RosterModel('Home'),
                RosterModel('Away'),
            )
            session.add(bout)
        await session.commit()

    # Start the Period
    assert bout is not None
    async with SessionLocal() as session, session.begin():
        session.add(bout)
        await session.refresh(bout)

        memento: Memento = DatabaseMemento(bout)
        _ = bout.add_jam(bout.teams[0], bout.teams[1])
        bout.is_running = True

        await session.commit()

    memento = await memento.restore()
    memento = await memento.restore()
    pass


async def _get_readonly_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session, session.begin():
        yield session
        await session.commit()


ReadOnlyAsyncSessionDepends: TypeAlias = Annotated[
    AsyncSession, Depends(_get_readonly_async_session)
]


class DatabaseMemento(Memento):
    def __init__(self, state: SQLModel) -> None:
        self._state: SQLModel = state

    @property
    def state(self) -> SQLModel:
        return self._state

    @override
    async def restore(self) -> Memento:
        async with SessionLocal() as session, session.begin():
            # Get the current state of the database object
            redo_memento: SQLModel = deepcopy(self.state)
            session.add(redo_memento)
            await session.refresh(redo_memento)

            # Merge the old state with the database
            _ = await session.merge(self.state)
            await session.commit()

            return DatabaseMemento(redo_memento)
