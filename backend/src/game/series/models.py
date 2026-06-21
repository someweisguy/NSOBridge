"""The Series model and associated business logic."""

from __future__ import annotations

from typing import TYPE_CHECKING, override

from core.db import CASCADE_CHILD, BaseSQLModel, CacheableSQLModel
from sqlalchemy import UUID, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .schemas import SeriesSchema

if TYPE_CHECKING:
    from core.db import CacheKey
    from game.bouts.models import BaseBout


class Series(CacheableSQLModel):
    """Represent a Series of Bouts.

    The Series is used to represent a sequence of Bouts. A Series can be thought of as
    an "event" which is hosted by a roller derby league or team such as a tournament or
    a double-header.

    """

    name: Mapped[str] = mapped_column(default='')
    active_bout_uuid: Mapped[UUID | None] = mapped_column(ForeignKey('bouts.uuid'))

    bouts: Mapped[list[BaseBout]] = relationship(
        'BaseBout',
        back_populates='_series',
        cascade=CASCADE_CHILD,
        foreign_keys='BaseBout.series_uuid',
        lazy='selectin',
    )

    __tablename__: str = 'series'

    def __init__(self, name: str) -> None:
        """Initialize a Series.

        Args:
            name (str): the name of the Series.

        """
        super().__init__(name=name)

    def set_active_bout(self, bout: BaseBout) -> None:
        """Set the active Bout for the Series."""
        if bout not in self.bouts:
            raise ValueError('The active Bout must be part of the Series.')
        if bout.uuid is None:
            raise TypeError('The active Bout must have a UUID.')

        self.active_bout_uuid = bout.uuid  # ty:ignore[invalid-assignment]

    @override
    def cache_key(self) -> CacheKey:
        # Special case where updating one Series invalidates the cache for all Series
        return (self.__tablename__, self.uuid)

    @override
    def serialize(self) -> SeriesSchema:
        return SeriesSchema.model_validate(self)

    @override
    def get_parents(self) -> tuple[BaseSQLModel, ...]:
        return ()
