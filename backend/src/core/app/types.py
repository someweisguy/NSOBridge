"""TODO."""

from __future__ import annotations

import typing
from typing import TYPE_CHECKING, Any, Protocol

if TYPE_CHECKING:
    from collections.abc import Iterable

    from sqlalchemy.ext.asyncio import AsyncSession

type CacheKey = tuple[Any, ...]
"""A cache key type used for the client model caching feature. """


@typing.runtime_checkable
class CacheableProtocol(Protocol):
    """Defines the protocol for cacheable items."""

    def get_updates(
        self, session: AsyncSession | None = None
    ) -> Iterable[CacheableProtocol]:
        """Get a collection of all the cacheable items that have been updated.

        Returns:
            Iterable[CacheableProtocol]: _description_

        """
        ...

    def cache_key(self) -> CacheKey:
        """Get the cache key of the cacheable.

        Returns:
            Any: _description_

        """
        ...


class Memento(Protocol):
    """Represent a memento point-in-time of the application state.

    Mementos can be used to implement functionality such as undo and redo by restoring
    the application to a previous state.
    """

    async def get_cache_updates(self) -> Iterable[CacheableProtocol]:
        """Get a list of the cache updates that will occur if this Memento is restored.

        Returns:
            Iterable[CacheableProtocol]: the cache updates.

        """
        ...

    async def restore(self) -> Memento:
        """Restore the state of the application to when this Memento was constructed.

        Returns:
            Memento: A Memento of the state of the application before this method was
            called. Calling `restore()` on this newly created Memento has the effect of
            redoing an operation.

        """
        ...
