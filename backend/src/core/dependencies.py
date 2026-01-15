"""Session dependencies to allow other modules to interact with the database."""

from __future__ import annotations

from typing import TYPE_CHECKING, Annotated, AsyncGenerator, ClassVar, TypeAlias

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from .database import BaseSQLModel, DatabaseEngine

if TYPE_CHECKING:
    from pathlib import Path


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
    def create_engine(cls, db_path: str | Path = '') -> DatabaseEngine:
        """Create a new DatabaseEngine.

        When no db_path is provided, an in-memory database engine will be created.

        Args:
            db_path (str, optional): the path to the database that will be created.
            Defaults to ''.

        Returns:
            DatabaseEngine: a new database engine.

        """
        return DatabaseEngine(BaseSQLModel, db_path)

    @classmethod
    async def yield_async_session(cls) -> AsyncGenerator[AsyncSession, None]:
        """Yield a session which automatically commits.

        This method is useful for FastAPI dependency injection.

        Returns:
            AsyncGenerator[AsyncEngine, None]: a generator which yields an AsyncSession

        Yields:
            Iterator[AsyncGenerator[AsyncEngine, None]]: an auto-committing
            AsyncSession.

        """
        db: DatabaseEngine = cls.get_default_engine()
        session_factory: async_sessionmaker[AsyncSession] = (
            db.get_async_session_factory()
        )
        async with session_factory() as session:
            yield session

            await session.commit()  # Automatically commit after each session


AsyncSessionDepends: TypeAlias = Annotated[
    AsyncSession,
    Depends(EngineFactory.yield_async_session),
]
