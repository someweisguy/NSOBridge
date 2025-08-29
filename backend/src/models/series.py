from __future__ import annotations

from typing import TYPE_CHECKING, Final

from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.models import SQLModel

if TYPE_CHECKING:
    from models.bout import GenericBoutModel


REQUIRED_NUM_TEAMS: Final[int] = 2
NUM_PERIODS: Final[int] = 2


class SeriesModel(SQLModel):
    __tablename__ = 'series'

    name: Mapped[str] = mapped_column(default='')
    bouts: Mapped[list[GenericBoutModel]] = relationship(back_populates='series')

    @property
    def parents(self) -> tuple[SQLModel, ...]:
        return ()
