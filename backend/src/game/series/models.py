"""The Series model and associated business logic."""

from __future__ import annotations

from typing import TYPE_CHECKING, override

from db import CASCADE_CHILD, BaseSQLModel, CacheableSQLModel
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .schemas import SeriesSchema

if TYPE_CHECKING:
    from core import CacheKey
    from game.bouts.models import BaseBout


class Series(CacheableSQLModel):
    """Represent a Series of Bouts.

    The Series is used to represent a sequence of Bouts. A Series can be thought of as
    an "event" which is hosted by a roller derby league or team such as a tournament or
    a double-header.

    """

    name: Mapped[str] = mapped_column(default='')

    bouts: Mapped[list[BaseBout]] = relationship(
        back_populates='_series',
        cascade=CASCADE_CHILD,
        lazy='selectin',
    )

    __tablename__: str = 'series'

    def __init__(self, name: str = '') -> None:
        """Initialize a Series.

        Args:
            name (str, optional): the name of the Series. Defaults to ''.

        """
        super().__init__(name=name)

    @override
    async def cache_key(self) -> CacheKey:
        # Special case where updating one Series invalidates the cache for all Series
        return (self.__tablename__, self.uuid)

    @override
    def serialize(self) -> SeriesSchema:
        return SeriesSchema.model_validate(self)

    @override
    async def get_parents(self) -> tuple[BaseSQLModel, ...]:
        return ()
