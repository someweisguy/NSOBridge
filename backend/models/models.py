from __future__ import annotations

import os
from abc import abstractmethod
from datetime import timedelta
from math import floor
from typing import Any, Callable, Final

from sqlalchemy import Dialect, event
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
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

DATABASE: str = os.environ.get('DB_PATH', ':memory:')
DEBUG: bool = os.environ.get('SQLALCHEMY_DEBUG', 'false').lower() in {'true', 'yes'}

engine: AsyncEngine = create_async_engine(f'sqlite+aiosqlite:///{DATABASE}', echo=DEBUG)
SessionLocal: async_sessionmaker[AsyncSession] = async_sessionmaker(bind=engine)
callbacks: Final[list[Callable[[set[CacheableModel]], None]]] = []


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

    id: Mapped[int] = mapped_column(primary_key=True)

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
    if len(callbacks) == 0:
        return

    # Recursively add each dirty, deleted, or new model
    cacheables: set[CacheableModel] = {
        parent
        for model in [
            record
            for identity_map in [session.dirty, session.deleted, session.new]
            for record in identity_map
            if isinstance(record, SQLModel)
        ]
        for parent in model.search_parents() | {model}
        if isinstance(parent, CacheableModel)
    }

    for callback in callbacks:
        callback(cacheables)
