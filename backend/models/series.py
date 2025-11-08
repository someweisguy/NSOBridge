from __future__ import annotations

from core import CHILD_RELATIONSHIP, CacheableSQLModel
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .bout import GenericBoutModel


class SeriesModel(CacheableSQLModel):
    rowid: Mapped[int] = mapped_column(system=True)
    name: Mapped[str] = mapped_column(default='')

    bouts: Mapped[list[GenericBoutModel]] = relationship(
        back_populates='series',
        cascade=CHILD_RELATIONSHIP,
        lazy='selectin',
        order_by=GenericBoutModel.order,
    )

    __tablename__: str = 'series'
