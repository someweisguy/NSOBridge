from __future__ import annotations

from core import CacheableSQLModel
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .bout import GenericBoutModel


class SeriesModel(CacheableSQLModel):
    __tablename__: str = 'series'

    name: Mapped[str] = mapped_column(default='')
    rowid: Mapped[int] = mapped_column(system=True)

    bouts: Mapped[list[GenericBoutModel]] = relationship(
        back_populates='series', lazy='selectin', order_by=GenericBoutModel.order
    )
