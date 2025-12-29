"""Base models for use in the other modules."""

from __future__ import annotations

import os
from datetime import timedelta
from typing import Final, final

from sqlalchemy import inspect
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import CascadeOptions, DeclarativeBase, Mapped, mapped_column

from .utils import _TimedeltaAsMilliseconds

_DB_PREFIX: Final[str] = 'sqlite+aiosqlite:///' + ''
_DEBUG: bool = os.environ.get('SQLALCHEMY_DEBUG', '').lower() in {'true', 'yes'}

CHILD_RELATIONSHIP: Final[str] = 'all, delete-orphan'
PARENT_RELATIONSHIP: Final[str] = 'expunge, save-update'


class BaseSQLModel(AsyncAttrs, DeclarativeBase):
    """The base model for all models in the database.

    This model has a standard SQL `id` field. It also includes a type annotation map to
    convert Python timedelta objects to an integer number of milliseconds.

    """

    id: Mapped[int | None] = mapped_column(nullable=False, primary_key=True)

    __abstract__: bool = True
    __type_annotation_map__: dict = {timedelta: _TimedeltaAsMilliseconds}

    def _get_parents(self) -> list[BaseSQLModel]:
        parents: list[BaseSQLModel] = []
        for name, mapper in inspect(self).mapper.relationships.items():
            if mapper.cascade == CascadeOptions(PARENT_RELATIONSHIP):
                parent: BaseSQLModel | None = getattr(self, name)
                if parent is not None:
                    parents.append(parent)
        return parents

    @final
    def search_parents(self) -> set[BaseSQLModel]:
        """Recursively get a set of this model's parents.

        This method is used to get the hierarchical branch of models that this model
        is on. This is useful to ensure that clients can update objects that may have
        updated.

        Returns:
            set[BaseSQLModel]: all of the parents of this model, up to the root model.

        """
        models: set[BaseSQLModel] = set()
        for parent in self._get_parents():
            models.add(parent)
            models |= parent.search_parents()
        return models
