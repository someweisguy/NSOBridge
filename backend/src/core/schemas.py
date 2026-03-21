"""Base schemas for use in other modules."""

from __future__ import annotations

import json
from abc import ABC
from datetime import datetime
from http import HTTPStatus
from typing import (
    TYPE_CHECKING,
    Any,
    ClassVar,
    Mapping,
    Sequence,
    override,
)

from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field, field_serializer
from pydantic.alias_generators import to_camel

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


type CacheServerSchema = Sequence[CacheKey]


class AboutDataClientSchema(ClientSchema):
    """Represent data received from clients requesting information about the server.

    The `process` field is optional. See `AboutDataServerSchema` for more information
    about its use.

    """

    process: datetime | None = None


class AboutDataServerSchema(ServerSchema):
    """Represent data to send to clients requesting information about this server.

    This schema contains three fields: `process`, `server`, and `version`. The `process`
    field is the process time which is sent by clients to the server. The server passes
    this data back to clients unchanged. The `server` field is the current datetime
    on this server.

    The `process` and `server` fields are provided to allow clients to synchronize game
    clocks with the server. To do so, Cristian's algorithm is used. To learn more about
    Cristian's algorithm, see: https://en.wikipedia.org/wiki/Cristian%27s_algorithm

    """

    process: datetime | None
    server: datetime = Field(default_factory=datetime.now, init=False)


class WebSocketServerSchema[T: Any](ServerSchema, ABC):
    """The base schema used by the server to send data to clients."""

    type: str
    data: T

    @field_serializer('data')
    def _reject_null_data(self, data: Any | None) -> Any:
        if data is None:
            raise ValueError('Cannot send a Websocket packet without data')
        return data


class CacheWebsocketServerSchema(WebSocketServerSchema[Sequence[CacheKey]]):
    """The schema used by the server to send cache invalidation data to clients."""

    def __init__(self, data: Sequence[CacheKey]) -> None:
        """Create a packet to send cache invalidation data.

        Args:
            data (Sequence[CacheKey]): a sequence of cache keys representing objects
            that should be invalidated in the clients' cache.

        """
        super().__init__(type='cache', data=data)


class AboutWebsocketServerSchema(WebSocketServerSchema[AboutDataServerSchema]):
    """The schema used by the server to send server information data to clients."""

    def __init__(self, process: datetime | None) -> None:
        """Create a packet to send data about this server.

        Args:
            process (datetime | None): The process timestamp received by the client or
            None if no such timestamp was received.

        """
        super().__init__(type='about', data=AboutDataServerSchema(process=process))
