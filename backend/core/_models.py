from __future__ import annotations

from copy import deepcopy
from datetime import timedelta
from math import floor
from typing import TYPE_CHECKING, Any, Final, final, override

from sqlalchemy import inspect
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

from core._database import SessionFactory
from core._users import Memento

if TYPE_CHECKING:
    from sqlalchemy import Dialect


CHILD_RELATIONSHIP: Final[str] = 'all, delete-orphan'
PARENT_RELATIONSHIP: Final[str] = 'expunge, save-update'


class RulesError(Exception):
    pass


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

    @override
    def __eq__(self, other: Any) -> bool:
        return isinstance(other, CacheableSQLModel) and other.key == self.key

    @override
    def __hash__(self) -> int:
        return hash(self.key)

    @final
    @property
    def key(self) -> tuple[str, int | None]:
        return (self.__tablename__, self.id)

    def get_snapshot(self) -> Memento:
        return DatabaseMemento(deepcopy(self))


class DatabaseMemento(Memento):
    def __init__(self, state: BaseSQLModel) -> None:
        self._detached_state_to_restore: BaseSQLModel = state

    @override
    async def restore(self) -> Memento:
        async with SessionFactory() as session, session.begin():
            # Get and detach the current state of the database object
            current_state: BaseSQLModel = await session.merge(
                self._detached_state_to_restore
            )
            session.add(current_state)
            await session.refresh(current_state)
            session.expunge(current_state)

            # Merge the desired state with the database
            _ = await session.merge(self._detached_state_to_restore)
            await session.commit()

            return DatabaseMemento(current_state)
