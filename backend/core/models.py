"""Base models for use in the other modules."""

from __future__ import annotations

from datetime import timedelta
from typing import Final

from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from .utils import _TimedeltaAsMilliseconds

CASCADE_CHILD: Final[str] = 'all, delete-orphan'
CASCADE_OTHER: Final[str] = 'expunge, save-update'


class BaseSQLModel(AsyncAttrs, DeclarativeBase):
    """The base model for all models in the database.

    This model has a standard SQL `id` field. It also includes a type annotation map to
    convert Python timedelta objects to an integer number of milliseconds.

    """

    id: Mapped[int | None] = mapped_column(nullable=False, primary_key=True)

    __abstract__: bool = True
    __type_annotation_map__: dict = {timedelta: _TimedeltaAsMilliseconds}

    async def get_parents(self) -> tuple[BaseSQLModel, ...]:
        """Asynchronously get a tuple of this model's direct parents.

        Returns:
            tuple[BaseSQLModel]: the immediate parents of this model.

        """
        ...

    async def get_recursive_parents(self) -> tuple[BaseSQLModel, ...]:
        """Recursively and asynchronously get a tuple of this model's parents.

        This method is used to get the hierarchical branch of models that this model
        is on. This is useful to ensure that clients can refresh objects that have
        updated.

        Returns:
            tuple[BaseSQLModel]: the recursive parents of this model.

        """
        recursive_parents: list[BaseSQLModel] = list(await self.get_parents())
        for parent in await self.get_parents():
            if isinstance(parent, BaseSQLModel):
                recursive_parents.extend(await parent.get_recursive_parents())
        return tuple(recursive_parents)
