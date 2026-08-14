"""TODO."""

from __future__ import annotations

import typing
from typing import TYPE_CHECKING, Any, Protocol

if TYPE_CHECKING:
    from fastapi import Request


type CacheKey = tuple[Any, ...]
"""A cache key type used for the client model caching feature. """


@typing.runtime_checkable
class CacheableProtocol(Protocol):
    """Defines the protocol for cacheable items."""

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

    async def restore(self, request: Request) -> Memento:
        """Restore the state of the application to when this Memento was constructed.

        Returns:
            Memento: A Memento of the state of the application before this method was
            called. Calling `restore()` on this newly created Memento has the effect of
            redoing an operation.

        """
        ...
