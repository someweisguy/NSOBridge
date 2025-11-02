from __future__ import annotations

import os
from datetime import timedelta
from math import floor
from typing import TYPE_CHECKING, Annotated, Any, TypeAlias, override

from fastapi import Depends
from sqlalchemy import Result, Select, select
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

if TYPE_CHECKING:
    from collections.abc import AsyncGenerator

    from sqlalchemy import Dialect

DATABASE: str = os.environ.get('DB_PATH', ':memory:')
DEBUG: bool = os.environ.get('SQLALCHEMY_DEBUG', 'false').lower() in {'true', 'yes'}

engine: AsyncEngine = create_async_engine(f'sqlite+aiosqlite:///{DATABASE}', echo=DEBUG)
SessionLocal: async_sessionmaker[AsyncSession] = async_sessionmaker(bind=engine)


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

    async with SessionLocal() as session, session.begin():
        statement: Select[tuple[GenericBoutModel]] = select(GenericBoutModel)
        results: Result[tuple[GenericBoutModel]] = await session.execute(statement)
        if results.scalar() is None:
            print('Creating initial Bout model')
            bout: BoutModel = BoutModel(
                SeriesModel(),
                RosterModel('Home'),
                RosterModel('Away'),
            )
            session.add(bout)
        await session.commit()


async def _get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session, session.begin():
        yield session
        await session.commit()


AsyncSessionDepends: TypeAlias = Annotated[AsyncSession, Depends(_get_async_session)]
