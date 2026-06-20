"""Handling of client and server caching."""

from __future__ import annotations

from typing import TYPE_CHECKING, Final

from sqlalchemy import URL
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker

from .models import BaseSQLModel

if TYPE_CHECKING:
    from pathlib import Path

session_factory: Final[async_sessionmaker[AsyncSession]] = async_sessionmaker[
    AsyncSession
](expire_on_commit=False)


def get_database_url(file_path: str | Path) -> URL:
    """Get a URL to a database.

    Args:
        file_path (str | Path): the path to the database.

    Returns:
        URL: A formatted URL for the SQLAlchemy database.

    """
    return URL.create('sqlite+aiosqlite', database=str(file_path))


async def create_tables(engine: AsyncEngine) -> None:
    """Create the database tables for a file.

    Args:
        engine (AsyncEngine): The async engine used to connect to the file.

    """
    async with engine.begin() as connection:
        await connection.run_sync(BaseSQLModel.metadata.create_all)
