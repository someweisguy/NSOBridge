"""Session dependencies to allow other modules to interact with the database."""

from __future__ import annotations

from typing import Annotated, ClassVar, TypeAlias

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from .models import BaseSQLModel
from .service import DatabaseEngine


class EngineFactory:
    """A factory class which creates database engines."""

    _default_engine: ClassVar[DatabaseEngine] = DatabaseEngine(BaseSQLModel)

    @classmethod
    def get_default_engine(cls) -> DatabaseEngine:
        """Get the default engine for this application.

        Returns:
            DatabaseEngine: the default engine.

        """
        return cls._default_engine

    @classmethod
    def set_default_engine(cls, engine: DatabaseEngine) -> None:
        """Set the default engine.

        Args:
            engine (DatabaseEngine): the new default engine.

        """
        cls._default_engine = engine

    @classmethod
    def create_engine(cls, db_path: str = '') -> DatabaseEngine:
        """Create a new DatabaseEngine.

        When no db_path is provided, an in-memory database engine will be created.

        Args:
            db_path (str, optional): the path to the database that will be created.
            Defaults to ''.

        Returns:
            DatabaseEngine: a new database engine.

        """
        return DatabaseEngine(BaseSQLModel, db_path)


AsyncSessionDepends: TypeAlias = Annotated[
    AsyncSession, Depends(EngineFactory.get_default_engine().yield_async_session)
]
