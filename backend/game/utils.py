"""Utility classes for use in the game module."""

from __future__ import annotations

from typing import TYPE_CHECKING, override

from core import Memento, db
from sqlalchemy import Result, Select, select

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import async_sessionmaker

    from .models import CacheableSQLModel


class DatabaseMemento(Memento):
    """A Memento sub-class for models in the database."""

    def __init__(self, state: CacheableSQLModel) -> None:
        """Construct a database Memento using the desired model.

        Args:
            state (CacheableSQLModel): the model with which a Memento should be created.

        """
        self._detached_state_to_restore: CacheableSQLModel = state

    @override
    async def restore(self) -> Memento:
        session_factory: async_sessionmaker = db.get_async_session_factory()
        async with session_factory() as session, session.begin():
            # Query and detach the current state of the database object
            table: type[CacheableSQLModel] = self._detached_state_to_restore.__class__
            statement: Select[tuple[CacheableSQLModel]] = select(table).where(
                table.id == self._detached_state_to_restore.id
            )
            results: Result[tuple[CacheableSQLModel]] = await session.execute(statement)
            current_state: CacheableSQLModel = results.scalar_one()
            session.expunge(current_state)

            # Merge the desired state with the database
            _ = await session.merge(self._detached_state_to_restore)
            await session.commit()

            return current_state.get_memento()
