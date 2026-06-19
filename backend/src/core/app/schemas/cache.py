"""Cache schemas."""

from __future__ import annotations

from typing import Any

from .base import ServerSchema


class CacheItemSchema(ServerSchema):
    """A utility class to associate a cache key with model data in JSON."""

    key: Any
    data: Any
