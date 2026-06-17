"""Cache schemas."""

from __future__ import annotations

from typing import Any

from .base import ServerSchema
from .types import CacheKey  # noqa: TC001, TC002


class CacheItemSchema(ServerSchema):
    """A utility class to associate a cache key with model data in JSON."""

    key: CacheKey
    data: Any
