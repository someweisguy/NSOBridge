from __future__ import annotations

from typing import TYPE_CHECKING

from models import CHILD_RELATIONSHIP, CacheableSQLModel
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from bouts.models import GenericBoutModel


class SeriesModel(CacheableSQLModel):
    rowid: Mapped[int] = mapped_column(system=True)
    name: Mapped[str] = mapped_column(default='')

    bouts: Mapped[list[GenericBoutModel]] = relationship(
        back_populates='series',
        cascade=CHILD_RELATIONSHIP,
        lazy='selectin',
    )

    __tablename__: str = 'series'
