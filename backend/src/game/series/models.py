"""The Series model and associated business logic."""

from __future__ import annotations

from typing import TYPE_CHECKING, override
from uuid import uuid4

from core.db import CASCADE_CHILD, BaseSQLModel, CacheableSQLModel
from game.bouts.models import BaseBout
from sqlalchemy import UUID, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from core.app import CacheKey


class Series(CacheableSQLModel):
    """Represent a Series of Bouts.

    The Series is used to represent a sequence of Bouts. A Series can be thought of as
    an "event" which is hosted by a roller derby league or team such as a tournament or
    a double-header.

    """

    _active_bout_uuid: Mapped[UUID | None] = mapped_column(ForeignKey('bouts.uuid'))
    name: Mapped[str] = mapped_column(default='')

    bouts: Mapped[list[BaseBout]] = relationship(
        back_populates='series',
        cascade=CASCADE_CHILD,
        foreign_keys='BaseBout._series_uuid',
        lazy='selectin',
        order_by=[BaseBout.num, BaseBout.created_on],
    )

    __tablename__: str = 'series'

    @override
    def __str__(self) -> str:
        return f'series `{self.name}`'

    @classmethod
    def create(cls, name: str) -> Series:
        """Initialize a Series.

        Args:
            name (str): the name of the Series.

        """
        return Series(uuid=uuid4(), name=name)

    @property
    def active_bout(self) -> BaseBout | None:
        """Get the currently active Bout.

        Returns None if there is not an active Bout.

        Returns:
            BaseBout | None: The currently active Bout or None.

        """
        return next(
            (bout for bout in self.bouts if bout.uuid == self._active_bout_uuid), None
        )

    @active_bout.setter
    def active_bout(self, bout: BaseBout) -> None:
        """Set the active Bout for the Series.

        Args:
            bout (BaseBout): the Bout to set as active.

        Raises:
            ValueError: if the provided Bout is not part of this Series.

        """
        if bout not in self.bouts:
            raise ValueError('The active Bout must be part of the Series.')

        # Prevent unnecessary cache updates
        if self._active_bout_uuid == bout.uuid:
            return

        # I'm not sure why ty thinks this is an invalid assignment...
        self._active_bout_uuid = bout.uuid  # ty:ignore[invalid-assignment]

    @override
    def cache_key(self) -> CacheKey:
        return (self.__tablename__, self.uuid)

    @override
    def get_parents(self) -> tuple[BaseSQLModel, ...]:
        return ()
