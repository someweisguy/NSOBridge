"""Base schemas for use in other modules."""

from __future__ import annotations

import json
from datetime import datetime
from http import HTTPStatus
from typing import (
    TYPE_CHECKING,
    Any,
    ClassVar,
    Mapping,
    override,
)

from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from pydantic.fields import Field

from .cache import get_updated_cache_items

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession
    from sqlalchemy.orm import Session
    from starlette.background import BackgroundTask


type CacheKey = tuple[Any, ...]


class ServerSchema(BaseModel):
    """The base schema for schemas which originate from this server.

    This is the base schema for all schemas that this server generates. It automatically
    converts all snake_case attributes, the Python standard, to camelCase, the
    Javascript and Typescript standard.
    """

    model_config: ClassVar[ConfigDict] = ConfigDict(
        alias_generator=to_camel,
        from_attributes=True,
        validate_by_name=True,
        serialize_by_alias=True,
    )


class ClientSchema(BaseModel):
    """The base schema for schemas which originate from outside of this server.

    This is the base schema for all schemas which are generated from outside of this
    server. It automatically converst all camelCase attributes, the Javascript and
    Typescript standard, to snake_case, the Python standard. This schema also forbids
    extra arguments, raising exceptions when additional fields are provided.

    """

    model_config: ClassVar[ConfigDict] = ConfigDict(
        alias_generator=to_camel,
        extra='forbid',
        from_attributes=True,
        validate_by_alias=True,
    )


class CacheItemSchema(ServerSchema):
    """A utility class to associate a cache key with model data in JSON."""

    key: CacheKey
    data: Any


class APISchema(ServerSchema):
    """The default schema for returning API requests."""

    status_code: int
    data: Any = None
    cache: list[CacheItemSchema] | None = Field(
        default=None, exclude_if=lambda c: c is None
    )
    error: ErrorSchema | None = Field(default=None, exclude_if=lambda e: e is None)
    timestamp: datetime = Field(default_factory=datetime.now, init=False)


class ErrorSchema(ServerSchema):
    """A schema for returning detailed error messages to clients."""

    type: str
    message: str


class VersionSchema(ServerSchema):
    """The schema which returns application version information."""

    version: str


class APIResponseClass(JSONResponse):
    """Used to wrap all API responses in a common JSON interface.

    See `core.schemas.APISchema`.
    """

    @override
    def __init__(
        self,
        content: Any,
        session: AsyncSession | Session | None = None,
        status_code: int = HTTPStatus.OK,
        headers: Mapping[str, str] | None = None,
        media_type: str | None = None,
        background: BackgroundTask | None = None,
    ) -> None:
        error_occurred: bool = status_code not in range(
            HTTPStatus.OK, HTTPStatus.MULTIPLE_CHOICES
        )
        cache: list[CacheItemSchema] | None = (
            [
                CacheItemSchema(key=model.cache_key(), data=model.serialize())
                for model in get_updated_cache_items(session)
            ]
            if session is not None
            else None
        )
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
