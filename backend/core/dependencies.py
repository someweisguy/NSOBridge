"""Session dependencies to allow other modules to interact with the database."""

from __future__ import annotations

from typing import TYPE_CHECKING, Annotated, Final, TypeAlias

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from core.service import EngineManager
from core.models import BaseSQLModel

if TYPE_CHECKING:
    from collections.abc import AsyncGenerator

db: Final[EngineManager] = EngineManager(BaseSQLModel)


async def _get_async_session(
    session_factory: Annotated[
        async_sessionmaker, Depends(db.get_async_session_factory)
    ],
) -> AsyncGenerator[AsyncSession, None]:
    async with session_factory() as session, session.begin():
        yield session

        await session.commit()  # Automatically commit after each session


AsyncSessionDepends: TypeAlias = Annotated[AsyncSession, Depends(_get_async_session)]
