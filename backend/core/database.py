from __future__ import annotations

import os
from copy import deepcopy
from datetime import timedelta
from math import floor
from typing import TYPE_CHECKING, Annotated, Any, TypeAlias, final, override

from fastapi import Depends
from sqlalchemy import Result, Select, event, select
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
    Session,
    UOWTransaction,
    mapped_column,
)
from sqlalchemy.types import Integer, TypeDecorator, TypeEngine

import core.ws
from core.history import Memento
from core.ws import WebSocketSchema

if TYPE_CHECKING:
    from collections.abc import AsyncGenerator

    from sqlalchemy import Dialect


_DATABASE: str = os.environ.get('DB_PATH', ':memory:')
_DEBUG: bool = os.environ.get('SQLALCHEMY_DEBUG', 'false').lower() in {'true', 'yes'}

CHILD_RELATIONSHIP = 'all, delete-orphan'
PARENT_RELATIONSHIP = 'expunge, save-update'

engine: AsyncEngine = create_async_engine(
    f'sqlite+aiosqlite:///{_DATABASE}', echo=_DEBUG
)
SessionLocal: async_sessionmaker[AsyncSession] = async_sessionmaker(
    bind=engine, expire_on_commit=False
)


class DatabaseMemento(Memento):
    def __init__(self, state: SQLModel) -> None:
        self._detached_state_to_restore: SQLModel = state

    @override
    async def restore(self) -> Memento:
        async with SessionLocal() as session, session.begin():
            # Get and detach the current state of the database object
            current_state: SQLModel = deepcopy(self._detached_state_to_restore)
            session.add(current_state)
            await session.refresh(current_state)
            session.expunge(current_state)

            # Merge the desired state with the database
            _ = await session.merge(self._detached_state_to_restore)
            await session.commit()

            return DatabaseMemento(current_state)


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

    def get_parents(self) -> tuple[SQLModel | None, ...]: ...

    def search_parents(self) -> set[SQLModel]:
        cacheables: set[SQLModel] = set()
        for parent in self.get_parents():
            if parent is None:
                continue  # TODO: log a warning of improper use of this function
            cacheables.add(parent)
            cacheables |= parent.search_parents()
        return cacheables


class CacheableModel(SQLModel):
    __abstract__: bool = True

    @override
    def __eq__(self, other: Any) -> bool:
        return isinstance(other, CacheableModel) and other.key == self.key

    @override
    def __hash__(self) -> int:
        return hash(self.key)

    @final
    @property
    def key(self) -> tuple[str, int | None]:
        return (self.__tablename__, self.id)

    def get_snapshot(self) -> Memento:
        return DatabaseMemento(deepcopy(self))


async def setup() -> None:
    async with engine.connect() as connection:
        await connection.run_sync(SQLModel.metadata.create_all)

    # TODO: decouple this module from importing from modules other than 'core'
    # Create a Bout model if one does not already exist
    from models import RosterModel, SeriesModel
    from models.rulesets.wftda_2025 import BoutModel

    bout: BoutModel | None = None
    async with SessionLocal() as session, session.begin():
        statement: Select[tuple[BoutModel]] = select(BoutModel)
        results: Result[tuple[BoutModel]] = await session.execute(statement)
        if results.scalar() is None:
            print('Creating initial Bout model')
            bout = BoutModel(
                SeriesModel(),
                RosterModel('Home'),
                RosterModel('Away'),
            )
            session.add(bout)
        await session.commit()


@event.listens_for(Session, 'after_flush')
def after_flush_hook(session: Session, _: UOWTransaction) -> None:
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

    # Broadcast model keys of all updated cacheable models to clients
    payload: WebSocketSchema = WebSocketSchema('cache')
    payload.data = tuple(cacheable.key for cacheable in cacheables)
    core.ws.broadcast(payload)


async def _get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session, session.begin():
        yield session
        await session.commit()


AsyncSessionDepends: TypeAlias = Annotated[AsyncSession, Depends(_get_async_session)]
