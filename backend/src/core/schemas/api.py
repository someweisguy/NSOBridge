"""Base schemas for use in other modules."""

from __future__ import annotations

import json
from datetime import datetime
from http import HTTPStatus
from typing import TYPE_CHECKING, Any, Mapping, override

from fastapi.responses import JSONResponse
from pydantic import Field

from .base import ServerSchema
from .cache import CacheItemSchema  # noqa: TC001

if TYPE_CHECKING:
    from starlette.background import BackgroundTask


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


class APIResponse(JSONResponse):
    """Used to wrap all API responses in a common JSON interface.

    See `core.schemas.APISchema`.
    """

    @override
    def __init__(
        self,
        content: Any,
        cache: list[CacheItemSchema] | None = None,
        status_code: int = HTTPStatus.OK,
        headers: Mapping[str, str] | None = None,
        media_type: str | None = None,
        background: BackgroundTask | None = None,
    ) -> None:
        error_occurred: bool = status_code not in range(
            HTTPStatus.OK, HTTPStatus.MULTIPLE_CHOICES
        )
        cache = [] if cache is None else cache
        super().__init__(
            APISchema(
                status_code=status_code,
                error=content if error_occurred else None,
                data=content if not error_occurred else None,
                cache=cache,
            ).model_dump(),
            status_code,
            headers,
            media_type,
            background,
        )

    @override
    def render(self, content: Any) -> bytes:
        return json.dumps(
            content,
            ensure_ascii=False,
            allow_nan=False,
            indent=None,
            separators=(',', ':'),
            default=(str),  # Serialize datetime objects
        ).encode('utf-8')
