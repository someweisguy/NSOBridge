"""Shared models implemented by the game logic."""

from __future__ import annotations

from abc import abstractmethod
from datetime import datetime, timedelta
from typing import override
from uuid import uuid4

from core.db import BaseSQLModel
from sqlalchemy import CheckConstraint, Constraint
from sqlalchemy.orm import Mapped, mapped_column


class TimeableModel(BaseSQLModel):
    """An abstract base model which has an associated duration."""

    __abstract__: bool = True

    @abstractmethod
    def start(self, timestamp: datetime) -> None:
        """Start the timeable object.

        Args:
            timestamp (datetime): The timestamp at which to start the model.

        Raises:
            RuntimeError: if the timeable object is already running.

        """
        ...

    @abstractmethod
    def stop(self, timestamp: datetime) -> None:
        """Stop the timeable object.

        Args:
            timestamp (datetime): the timestamp at which to stop the model.

        Raises:
            RuntimeError: if the timeable object is already stopped.

        """
        ...

    @abstractmethod
    def is_started(self) -> bool:
        """Return True if the timeable object is started.

        If this timeable object is stopped, this method will return True.

        Returns:
            bool: True if the timeable object is started.

        """
        ...

    @abstractmethod
    def is_running(self) -> bool:
        """Return True if this timeable object is running.

        Returns:
            bool: True if this timeable object is running.

        """
        ...

    @abstractmethod
    def is_stopped(self) -> bool:
        """Return True if this timeable object is stopped.

        Returns:
            bool: True if this timeable object is stopped.

        """
        ...

    @abstractmethod
    def get_duration(self, timestamp: datetime | None = None) -> timedelta:
        """Get the duration that has elapsed in this timeable object.

        Args:
            timestamp (datetime | None, optional): The timestamp which should be used to
            calculate the remaining time on the timeable object. If None is provided,
            the current timestamp will be used. Defaults to None.

        Raises:
            ValueError: if a timestamp that occurs before the start of the timeable
            object is provided.

        Returns:
            timedelta: the elapsed time on this timeable object.

        """
        ...


class AbstractOneShotModel(TimeableModel):
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

    @override
    def start(self, timestamp: datetime) -> None:
        if self.is_running():
            raise RuntimeError('Cannot start a one-shot when it is already running')
        self.start_timestamp = timestamp

    @override
    def stop(self, timestamp: datetime) -> None:
        if self.start_timestamp is None:
            raise RuntimeError('Cannot stop a one-shot when it is not running')
        if self.stop_timestamp is not None:
            raise RuntimeError('Cannot stop a one-shot when it has already stopped')
        if timestamp < self.start_timestamp:
            raise ValueError('Cannot stop a one-shot before it has been started')
        self.stop_timestamp = timestamp

    @override
    def is_started(self) -> bool:
        return self.start_timestamp is not None

    @override
    def is_running(self) -> bool:
        return self.is_started() and not self.is_stopped()

    @override
    def is_stopped(self) -> bool:
        return self.stop_timestamp is not None

    @override
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


class Clock(TimeableModel):
    """Represent a Clock.

    Clocks differ from one-shots in that Clocks can be started and stopped multiple
    times. They can be used to represent time objects such as the Period or Penalty
    clocks.
    """

    start_timestamp: Mapped[datetime | None] = mapped_column(default=None)
    elapsed: Mapped[timedelta] = mapped_column(default=timedelta(seconds=0))
    alarm: Mapped[timedelta] = mapped_column(default=timedelta(seconds=0))

    __tablename__: str = 'clocks'

    @classmethod
    def create(cls) -> Clock:
        """Instantiate a clock.

        Returns:
            Clock: a new Clock.

        """
        return Clock(uuid=uuid4())

    @override
    def get_parents(self) -> tuple[BaseSQLModel, ...]:
        return ()

    @override
    def start(self, timestamp: datetime) -> None:
        if self.is_running():
            raise RuntimeError('Cannot start a Clock when it is already running')
        self.start_timestamp = timestamp

    @override
    def stop(self, timestamp: datetime) -> None:
        if self.start_timestamp is None:
            raise RuntimeError('Cannot stop a one-shot when it is not running')
        if timestamp < self.start_timestamp:
            raise ValueError('Cannot stop a one-shot before it has been started')
        self.elapsed += timestamp - self.start_timestamp
        self.start_timestamp = None

    @override
    def is_started(self) -> bool:
        return self.start_timestamp is not None or self.elapsed.total_seconds() > 0

    @override
    def is_running(self) -> bool:
        return self.start_timestamp is not None

    @override
    def is_stopped(self) -> bool:
        return self.start_timestamp is None

    @override
    def get_duration(self, timestamp: datetime | None = None) -> timedelta:
        if timestamp is None:
            timestamp = datetime.now()
        if self.start_timestamp is None:
            return self.elapsed
        if timestamp < self.start_timestamp:
            raise ValueError('Cannot get a duration for a time that is in the past')
        return (timestamp - self.start_timestamp) + self.elapsed

    def reset(self) -> None:
        """Reset the clock to zero."""
        self.elapsed = timedelta(seconds=0)
