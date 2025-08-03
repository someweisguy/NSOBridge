from __future__ import annotations

from abc import abstractmethod
from datetime import timedelta
from math import floor
from typing import Any

from sqlalchemy import Dialect, event
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    Session,
    UOWTransaction,
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

    def search_parents(self) -> set[SQLModel]:
        cacheables: set[SQLModel] = set()
        for parent in self.parents:
            if parent is None:
                continue  # TODO: log a warning of improper use of this function
            cacheables.add(parent)
            cacheables |= parent.search_parents()
        return cacheables


class CacheableModel(SQLModel):
    __abstract__ = True

    def __eq__(self, other: Any) -> bool:
        return isinstance(other, CacheableModel) and other.key == self.key

    def __hash__(self) -> int:
        return hash(self.key)

    @property
    @abstractmethod
    def key(self) -> tuple[Any, ...]: ...


@event.listens_for(Session, 'after_flush')
def after_flush_hook(session: Session, flush_context: UOWTransaction) -> None:
    # Get each new cacheable model
    # This is done separately because parents of these models could be None
    cacheables: set[CacheableModel] = {
        item for item in session.new if isinstance(item, CacheableModel)
    }
    # Recursively add each dirty or deleted model
    cacheables |= {
        parent
        for model in [
            record
            for identity_map in [session.dirty, session.deleted]
            for record in identity_map
            if isinstance(record, SQLModel)
        ]
        for parent in model.search_parents()
        if isinstance(parent, CacheableModel)
    }

    print([cacheable.key for cacheable in cacheables])  # TODO: hook into websockets
