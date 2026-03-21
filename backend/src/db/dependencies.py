"""Session dependencies to allow other modules to interact with the database."""

from __future__ import annotations

from typing import Annotated, AsyncGenerator, TypeAlias

from core import invalidate_queries
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from .cache import get_mutated_cache_models
from .engine import DatabaseEngine


async def _yield_async_session() -> AsyncGenerator[AsyncSession, None]:
    """Yield a session which automatically commits.

    This method is useful for FastAPI dependency injection.

    Returns:
        AsyncGenerator[AsyncEngine, None]: a generator which yields an AsyncSession

    Yields:
        Iterator[AsyncGenerator[AsyncEngine, None]]: an auto-committing
        AsyncSession.

    """
    session_factory: async_sessionmaker[AsyncSession] = (
        DatabaseEngine.get_engine().get_async_session_factory()
    )
    async with session_factory() as session:
        yield session

        cache_keys = []
        models = await get_mutated_cache_models(session)
        for model in models:
            cache_keys.append(model.cache_key())

        await session.commit()  # Automatically commit after each session

    if len(cache_keys) > 0:
        await invalidate_queries(cache_keys)


GetAsyncSession: TypeAlias = Annotated[
    AsyncSession,
    Depends(_yield_async_session),
]
