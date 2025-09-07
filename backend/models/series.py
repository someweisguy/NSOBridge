from __future__ import annotations

from typing import final

from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.bout import GenericBoutModel
from models.models import CacheableModel, SQLModel


class SeriesModel(CacheableModel):
    __tablename__ = 'series'

    rowid: Mapped[int] = mapped_column(system=True)
    name: Mapped[str] = mapped_column(default='')
    bouts: Mapped[list[GenericBoutModel]] = relationship(
        back_populates='series', lazy='selectin', order_by=GenericBoutModel.order
    )

    @final
    @property
    def key(self) -> tuple[str, int]:
        return (self.__tablename__, self.rowid)

    @property
    def parents(self) -> tuple[SQLModel, ...]:
        return ()
