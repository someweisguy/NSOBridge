"""Handling of client and server caching."""

from __future__ import annotations

from typing import TYPE_CHECKING

import core

from .model import CacheableSQLModel

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession
    from sqlalchemy.orm import Session


from .model import BaseSQLModel


async def get_mutated_cache_models(
    session: AsyncSession | Session,
) -> list[CacheableSQLModel]:
    """Get a list of the cacheables which have been modified in the desired session.

    Args:
        session (AsyncSession | Session): the session which to check.

    Returns:
        list[CacheItem]: a list of all the cacheable models which have been modified
        and their cache keys.

    """
    # Add each dirty or deleted model to a set for updates
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
            for parent in await model.get_recursive_parents()
            if isinstance(parent, CacheableSQLModel)
        }

    return list(cacheables)


async def invalidate_cached_models(models: list[CacheableSQLModel]) -> None:
    """Invalidate the specified cached models.

    This informs all clients that the keys of the specified models have been updated
    and must be queried again.

    Args:
        models (list[CacheableSQLModel]): a list of models to be invalidated.

    """
    await core.send_all('cache', [model.cache_key() for model in models])
