"""TODO."""

from __future__ import annotations

import typing
from typing import Any, Iterable, Protocol

type CacheKey = tuple[Any, ...]
"""A cache key type used for the client model caching feature. """


@typing.runtime_checkable
class CacheableProtocol(Protocol):
    """Defines the protocol for cacheable items."""

    def get_updates(self) -> Iterable[CacheableProtocol]:
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
