"""Utility functions."""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session

from .base_model import BaseSQLModel
from .cache_model import CacheableSQLModel


def get_updated_cache_items(
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
        for identity_map in [session.dirty, session.deleted]
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

    return list(cacheables)
