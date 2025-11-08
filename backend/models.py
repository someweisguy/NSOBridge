from __future__ import annotations

from copy import deepcopy
from datetime import timedelta
from math import floor
from typing import TYPE_CHECKING, Any, Final, final, override

from database import SessionFactory, engine
from sqlalchemy import Result, Select, inspect, select
from sqlalchemy.ext.asyncio import (
    AsyncAttrs,
)
from sqlalchemy.orm import (
    CascadeOptions,
    DeclarativeBase,
    Mapped,
    mapped_column,
)
from sqlalchemy.types import Integer, TypeDecorator, TypeEngine
from users.users import Memento

if TYPE_CHECKING:
    from sqlalchemy import Dialect


CHILD_RELATIONSHIP: Final[str] = 'save-update, merge, expunge, delete, delete-orphan'
PARENT_RELATIONSHIP: Final[str] = 'expunge, save-update'


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


class BaseSQLModel(AsyncAttrs, DeclarativeBase):
    __abstract__: bool = True
    __type_annotation_map__ = {timedelta: TimedeltaAsMilliseconds}

    id: Mapped[int | None] = mapped_column(nullable=False, primary_key=True)

    @final
    def get_parents(self) -> list[BaseSQLModel]:
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
        for parent in self.get_parents():
            cacheables.add(parent)
            cacheables |= parent.search_parents()
        return cacheables


class CacheableSQLModel(BaseSQLModel):
    __abstract__: bool = True

    # TODO: are these needed?
    @override
    def __eq__(self, other: Any) -> bool:
        return isinstance(other, CacheableSQLModel) and other.key == self.key

    # TODO: are these needed?
    @override
    def __hash__(self) -> int:
        return hash(self.key)

    # TODO: can this be a method instead of a property?
    @final
    @property
    def key(self) -> tuple[str, int | None]:
        return (self.__tablename__, self.id)

    def get_snapshot(self) -> DatabaseMemento:
        copy = deepcopy(self)
        return DatabaseMemento(copy)


class DatabaseMemento(Memento):
    def __init__(self, state: CacheableSQLModel) -> None:
        self._detached_state_to_restore: CacheableSQLModel = state

    @override
    async def restore(self) -> Memento:
        async with SessionFactory() as session, session.begin():
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

            return current_state.get_snapshot()


async def create_all() -> None:
    async with engine.connect() as database:
        await database.run_sync(BaseSQLModel.metadata.create_all)
