"""Session dependencies to allow other modules to interact with the database."""

from __future__ import annotations

from typing import Annotated, AsyncGenerator, TypeAlias

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from .constants import session_factory
from .models import BaseSQLModel, CacheableSQLModel


async def _yield_async_session() -> AsyncGenerator[AsyncSession, None]:
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


GetAsyncSession: TypeAlias = Annotated[
    AsyncSession,
    Depends(_yield_async_session, scope='function'),
]
"""FastAPI dependency injection which gets a session from the default session factory.

Each new session is auto-committed at the end of each endpoint and client cache keys
are automatically invalidated.
"""
