"""Session dependencies to allow other modules to interact with the database."""

from __future__ import annotations

from typing import Annotated, AsyncGenerator, TypeAlias

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from .models import BaseSQLModel
from .service import CacheableSQLModel, invalidate_cached_models, session_factory


async def _yield_async_session() -> AsyncGenerator[AsyncSession, None]:
    """Yield a session which automatically commits.

    This method is useful for FastAPI dependency injection.

    Returns:
        AsyncGenerator[AsyncEngine, None]: a generator which yields an AsyncSession

    Yields:
        Iterator[AsyncGenerator[AsyncEngine, None]]: an auto-committing
        AsyncSession.

    """
    async with session_factory() as session:
        yield session

        # Get a list of query keys to invalidate before committing the session
        models: set[BaseSQLModel] = {
            model
            for identity_map in [session.dirty]
            for model in identity_map
            if isinstance(model, BaseSQLModel)
        }

        # Extract the cacheable models from the session
        cacheables: set[CacheableSQLModel] = {
            model for model in models if isinstance(model, CacheableSQLModel)
        }
        for model in models:
            cacheables |= {
                parent
                for parent in model.get_recursive_parents()
                if isinstance(parent, CacheableSQLModel)
            }

        await session.commit()

    if len(models) > 0:
        await invalidate_cached_models(list(cacheables))


GetAsyncSession: TypeAlias = Annotated[
    AsyncSession,
    Depends(_yield_async_session, scope='function'),
]
