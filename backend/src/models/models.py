from __future__ import annotations

from datetime import timedelta
from math import floor
from typing import Any

from sqlalchemy import Dialect
from sqlalchemy.ext.asyncio import (
    AsyncAttrs,
    AsyncEngine,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    MappedAsDataclass,
    mapped_column,
)
from sqlalchemy.types import Integer, TypeDecorator

engine: AsyncEngine = create_async_engine('sqlite+aiosqlite:///data.db', echo=True)
SessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine)


class TimedeltaAsMilliseconds(TypeDecorator[Integer]):
    impl = Integer
    cache_ok = True

    def process_bind_param(self, value: Any | None, dialect: Dialect) -> Any:
        if value is not None:
            assert isinstance(value, timedelta)
            return floor(value.total_seconds() * 1000)
        return value

    def process_result_value(self, value: Any | None, dialect: Dialect) -> Any | None:
        assert isinstance(value, (float, int))
        return timedelta(milliseconds=value)


class SQLModel(AsyncAttrs, MappedAsDataclass, DeclarativeBase):
    _id: Mapped[int] = mapped_column(primary_key=True, init=False)
