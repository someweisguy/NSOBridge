"""Cache schemas."""

from __future__ import annotations

from typing import Any

from core.types import CacheKey  # noqa: TC002

from .base import ServerSchema


class CacheItemSchema(ServerSchema):
    """A utility class to associate a cache key with model data in JSON."""

    key: CacheKey
    data: Any
