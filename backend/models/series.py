from __future__ import annotations

from typing import final, override

from core.database import SQLModel
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .bout import GenericBoutModel
from .models import CacheableModel


class SeriesModel(CacheableModel):
    __tablename__: str = 'series'

    name: Mapped[str] = mapped_column(default='')
    rowid: Mapped[int] = mapped_column(system=True)

    bouts: Mapped[list[GenericBoutModel]] = relationship(
        back_populates='series', lazy='selectin', order_by=GenericBoutModel.order
    )

    @final
    @property
    @override
    def key(self) -> tuple[str, int]:
        return (self.__tablename__, self.rowid)

    @property
    @override
    def parents(self) -> tuple[SQLModel, ...]:
        return ()
