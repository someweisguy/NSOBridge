from __future__ import annotations

from typing import TYPE_CHECKING, override

from core.models import CHILD_RELATIONSHIP, CacheableSQLModel, CacheKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from game.bouts.models import BaseBout


class Series(CacheableSQLModel):
    rowid: Mapped[int] = mapped_column(system=True)
    name: Mapped[str] = mapped_column(default='')

    bouts: Mapped[list[BaseBout]] = relationship(
        back_populates='series',
        cascade=CHILD_RELATIONSHIP,
        lazy='selectin',
    )

    __tablename__: str = 'series'

    @override
    def cache_key(self) -> CacheKey:
        # Special case where updating one Series invalidates the cache for all Series
        return (self.__tablename__, [], {})
