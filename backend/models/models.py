from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timedelta
from typing import TYPE_CHECKING, Any, override

import core.ws
from core.database import DatabaseMemento, SQLModel
from core.ws import WebSocketSchema
from sqlalchemy import CheckConstraint, event
from sqlalchemy.orm import (
    Mapped,
    Session,
    UOWTransaction,
    declared_attr,
    mapped_column,
)

if TYPE_CHECKING:
    from core.history import Memento

CHILD_RELATIONSHIP = 'all, delete-orphan'
PARENT_RELATIONSHIP = 'expunge, save-update'


class CacheableModel(SQLModel):
    __abstract__: bool = True

    @override
    def __eq__(self, other: Any) -> bool:
        return isinstance(other, CacheableModel) and other.key == self.key

    @override
    def __hash__(self) -> int:
        return hash(self.key)

    @property
    def key(self) -> tuple[Any, ...]: ...

    def get_snapshot(self) -> Memento:
        return DatabaseMemento(deepcopy(self))


class AbstractOneShotModel(SQLModel):
    __abstract__: bool = True

    start_timestamp: Mapped[datetime | None] = mapped_column(default=None)
    stop_timestamp: Mapped[datetime | None] = mapped_column(default=None)

    @declared_attr
    def __table_args__(cls) -> Any:
        return (
            CheckConstraint('start_timestamp < stop_timestamp'),
            CheckConstraint('start_timestamp IS NOT NULL OR stop_timestamp IS NULL'),
        )

    def start(self, timestamp: datetime) -> None:
        if self.is_running():
            raise RuntimeError('Cannot start a Clock when it is already running')
        self.start_timestamp = timestamp

    def stop(self, timestamp: datetime) -> None:
        if not self.is_running():
            raise RuntimeError('Cannot stop a Clock when it is already stopped')
        assert self.start_timestamp is not None
        if timestamp < self.start_timestamp:
            raise RuntimeError('Cannot stop a Clock before it has been started')
        self.stop_timestamp = timestamp

    def is_running(self) -> bool:
        return self.start_timestamp is not None and self.stop_timestamp is None

    def is_finished(self) -> bool:
        return self.start_timestamp is not None and self.stop_timestamp is not None

    def get_duration(self, timestamp: datetime | None = None) -> timedelta:
        if timestamp is None:
            timestamp = datetime.now()
        if self.start_timestamp is None:
            return timedelta(seconds=0)
        elif self.stop_timestamp is not None:
            return self.stop_timestamp - self.start_timestamp
        else:
            if timestamp < self.start_timestamp:
                raise ValueError('Cannot get a duration for a time that is in the past')
            return timestamp - self.start_timestamp


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
