from __future__ import annotations

from typing import TYPE_CHECKING, Final, final

from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.models import CacheableModel, SQLModel

if TYPE_CHECKING:
    from models.bout import GenericBoutModel


REQUIRED_NUM_TEAMS: Final[int] = 2
NUM_PERIODS: Final[int] = 2


class SeriesModel(CacheableModel):
    __tablename__ = 'series'

    name: Mapped[str] = mapped_column(default='')
    bouts: Mapped[list[GenericBoutModel]] = relationship(
        back_populates='series',
        lazy='selectin',
        # TODO: order_by='order' throws an error
    )

    @final
    @property
    def key(self) -> tuple[str, int]:
        return (self.__tablename__, self.id)

    @property
    def parents(self) -> tuple[SQLModel, ...]:
        return ()
