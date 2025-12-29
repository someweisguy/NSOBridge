"""Base models used by the game module."""

from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timedelta
from typing import Any

from core import BaseSQLModel
from sqlalchemy import CheckConstraint, Constraint
from sqlalchemy.orm import Mapped, mapped_column

from .utils import DatabaseMemento

type CacheKey = tuple[Any, ...]


class CacheableSQLModel(BaseSQLModel):
    """A database model which can be cached by clients.

    Cacheable SQL models are the 'primary' models of the database. Clients are able to
    query cacheable models only. Non-cacheable models should not be queried. Cacheable
    models have cache keys which are unique keys used by clients to cache data to
    prevent query duplication.
    """

    __abstract__: bool = True

    def cache_key(self) -> CacheKey:
        """Get the cache key of this model.

        Return a unique cache key for this model which can be used by clients to cache
        model data. Cache keys should be serializable by Pydantic and should generally
        not be used in any business logic.

        Returns:
            CacheKey: the unique cache key of this model.

        """
        ...

    def get_memento(self) -> DatabaseMemento:
        """Get a memento of the current state of this model and all its children.

        Returns:
            DatabaseMemento: a Memento of this model's state.

        """
        copy: CacheableSQLModel = deepcopy(self)
        return DatabaseMemento(copy)


class AbstractOneShotModel(BaseSQLModel):
    """The abstract base class for one-shot models.

    One-shot models are models which can be started and stopped only once. Once a
    one-shot is stopped, a new one-shot must be instantiated and started. An example of
    this would be a Jam or a Timeout. Once the Jam ends, it is permanently over. The
    Period Clock, on the other hand, can be started and stopped multiple times.
    """

    start_timestamp: Mapped[datetime | None] = mapped_column(default=None)
    stop_timestamp: Mapped[datetime | None] = mapped_column(default=None)

    __abstract__: bool = True

    __table_args__: tuple[Constraint, ...] = (
        CheckConstraint('start_timestamp < stop_timestamp'),
        CheckConstraint('start_timestamp IS NOT NULL OR stop_timestamp IS NULL'),
    )

    def start(self, timestamp: datetime) -> None:
        """Start the one-shot.

        Args:
            timestamp (datetime): The timestap at which to start the model.

        Raises:
            RuntimeError: if the one-shot is already running.

        """
        if self.is_running():
            raise RuntimeError('Cannot start a one-shot when it is already running')
        self.start_timestamp = timestamp

    def stop(self, timestamp: datetime) -> None:
        """Stop the one-shot.

        Args:
            timestamp (datetime): the timestamp at which to stop the model.

        Raises:
            RuntimeError: if the one-shot is not currently running.
            ValueError: if the stop timestamp is before the start timestamp.

        """
        if not self.is_running():
            raise RuntimeError('Cannot stop a one-shot when it is already stopped')
        assert self.start_timestamp is not None
        if timestamp < self.start_timestamp:
            raise ValueError('Cannot stop a one-shot before it has been started')
        self.stop_timestamp = timestamp

    def is_started(self) -> bool:
        """Return True if the one-shot is started.

        If this one-shot is finished, this method will return True.

        Returns:
            bool: True if the one-shot is started.

        """
        return self.start_timestamp is not None

    def is_running(self) -> bool:
        """Return True if this one-shot is running.

        Returns:
            bool: True if this one-shot is running.

        """
        return self.is_started() and not self.is_finished()

    def is_finished(self) -> bool:
        """Return True if this one-shot is finished.

        Returns:
            bool: True if this one-shot is finished.

        """
        return self.stop_timestamp is not None

    def get_duration(self, timestamp: datetime | None = None) -> timedelta:
        """Get the duration that has elapsed in this one-shot at the desired timestamp.

        Args:
            timestamp (datetime | None, optional): The timestamp which should be used to
            calculate the remaining time on the one-shot. If None is provided, the
            current timestamp will be used. Defaults to None.

        Raises:
            ValueError: if a timestamp that occurs before the start of the one-shot is
            provided.

        Returns:
            timedelta: the elapsed time on this one-shot.

        """
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
