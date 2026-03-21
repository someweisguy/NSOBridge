"""Base schemas for use in other modules."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import Field

from .base import ServerSchema
from .cache import CacheItemSchema  # noqa: TC001


class APISchema(ServerSchema):
    """The default schema for returning API requests."""

    data: Any
    cache: list[CacheItemSchema] = Field(
        default_factory=list, exclude_if=lambda c: len(c) == 0
    )
    status_code: int = Field(default=200, kw_only=True)
    error: ErrorSchema | None = Field(default=None, exclude_if=lambda e: e is None)
    timestamp: datetime = Field(default_factory=datetime.now, init=False)


class ErrorSchema(ServerSchema):
    """A schema for returning detailed error messages to clients."""

    type: str
    message: str


class VersionSchema(ServerSchema):
    """The schema which returns application version information."""

    version: str
