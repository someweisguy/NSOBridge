from __future__ import annotations

from abc import abstractmethod
from datetime import timedelta
from math import floor
from typing import Any

from sqlalchemy import Dialect
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
)
from sqlalchemy.types import Integer, TypeDecorator

engine: AsyncEngine = create_async_engine('sqlite+aiosqlite:///data.db', echo=False)
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


class SQLModel(DeclarativeBase):
    __abstract__ = True
    _id: Mapped[int] = mapped_column(primary_key=True)

    @property
    @abstractmethod
    def parents(self) -> tuple[SQLModel | None, ...]: ...


class CacheableModel(SQLModel):
    __abstract__ = True

    def __eq__(self, other: Any) -> bool:
        return isinstance(other, CacheableModel) and other.key == self.key

    def __hash__(self) -> int:
        return hash(self.key)

    @property
    def key(self) -> tuple[str, int]:
        return (self.__tablename__, self._id)
