"""Types."""

from typing import Any, Sequence

type CacheKey = tuple[Any, ...]
"""Used by the client to cache requests locally."""

type CacheServerSchema = Sequence[CacheKey]
"""The schema for packet WebSocket cache invalidation messages."""
