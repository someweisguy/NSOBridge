from __future__ import annotations

from typing import TYPE_CHECKING, final, override

from core.database import CacheableModel
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .bout import GenericBoutModel

if TYPE_CHECKING:
    from core.database import SQLModel


class SeriesModel(CacheableModel):
    __tablename__: str = 'series'

    name: Mapped[str] = mapped_column(default='')
    rowid: Mapped[int] = mapped_column(system=True)

    bouts: Mapped[list[GenericBoutModel]] = relationship(
        back_populates='series', lazy='selectin', order_by=GenericBoutModel.order
    )

    @property
    @override
    def key(self) -> tuple[str, int]:
        return (self.__tablename__, self.rowid)

    @property
    @override
    def parents(self) -> tuple[SQLModel, ...]:
        return ()
