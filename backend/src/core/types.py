"""Types."""

from typing import Any, Sequence

type CacheKey = tuple[Any, ...]
type CacheServerSchema = Sequence[CacheKey]
