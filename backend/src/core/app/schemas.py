"""Core application schemas."""

from __future__ import annotations

from abc import ABC
from datetime import datetime
from typing import Any, ClassVar, Sequence

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    ModelWrapValidatorHandler,
    field_serializer,
    model_validator,
)
from pydantic.alias_generators import to_camel

from .service import get_schema
from .types import CacheableProtocol


class ServerSchema(BaseModel):
    """The base schema for schemas which originate from this server.

    This is the base schema for all schemas that this server generates. It automatically
    converts all snake_case attributes, the Python standard, to camelCase, the
    Javascript and Typescript standard.
    """

    model_config: ClassVar[ConfigDict] = ConfigDict(
        alias_generator=to_camel,
        arbitrary_types_allowed=True,
        from_attributes=True,
        validate_by_name=True,
        serialize_by_alias=True,
    )


class ClientSchema(BaseModel):
    """The base schema for schemas which originate from outside of this server.

    This is the base schema for all schemas which are generated from outside of this
    server. It automatically converts all camelCase attributes, the Javascript and
    Typescript standard, to snake_case, the Python standard. This schema also forbids
    extra arguments, raising exceptions when additional fields are provided.

    """

    model_config: ClassVar[ConfigDict] = ConfigDict(
        alias_generator=to_camel,
        extra='forbid',
        from_attributes=True,
        validate_by_alias=True,
    )


class SchemaWithCache[T: ServerSchema](ServerSchema):
    """A special schema that renders cache updates."""

    data: T | None = Field(default=None)
    cache: list[CacheItemSchema] = Field(
        default_factory=[], exclude_if=lambda c: not len(c)
    )

    @model_validator(mode='wrap')
    @classmethod
    def _generate_schema(
        cls, data: Any, handler: ModelWrapValidatorHandler[Any]
    ) -> Any:
        if not isinstance(data, CacheableProtocol):
            return handler(data)

        return SchemaWithCache(
            data=get_schema(type(data)).model_validate(data),
            cache=[
                CacheItemSchema(
                    key=model.cache_key(),
                    data=get_schema(type(model)).model_validate(model),
                )
                for model in data.get_updates()
            ],
        )


class APISchema[T: Any](ServerSchema):
    """The default schema for returning API requests."""

    data: T
    cache: list[CacheItemSchema] | None = Field(default=None, exclude=True)

    def __init__(self, data: T) -> None:
        """Initialize the schema and generate cache schemas, if applicable."""
        cache: list[CacheableProtocol] | None = (
            data.get_updates() if isinstance(data, CacheableProtocol) else None
        )
        super().__init__()
        self.data = data
        self.cache = (
            [
                CacheItemSchema(
                    key=model.cache_key(),
                    data=get_schema(type(model)).model_validate(model),
                )
                for model in cache
            ]
            if cache is not None
            else None
        )


class ErrorSchema(ServerSchema):
    """A schema for returning detailed error messages to clients."""

    type: str
    message: str


class VersionSchema(ServerSchema):
    """The schema which returns application version information."""

    version: str


class CacheItemSchema(ServerSchema):
    """A utility class to associate a cache key with model data in JSON."""

    key: Any
    data: Any


class WebSocketServerSchema[T: Any](ServerSchema, ABC):
    """The base schema used by the server to send data to clients."""

    type: str
    data: T

    @field_serializer('data')
    def _reject_null_data(self, data: Any | None) -> Any:
        if data is None:
            raise ValueError('Cannot send a Websocket packet without data')
        return data


class CacheWebsocketServerSchema(WebSocketServerSchema[Sequence[Any]]):
    """The schema used by the server to send cache invalidation data to clients."""

    def __init__(self, data: Sequence[Any]) -> None:
        """Create a packet to send cache invalidation data.

        Args:
            data (Sequence[CacheKey]): a sequence of cache keys representing objects
            that should be invalidated in the clients' cache.

        """
        super().__init__(type='cache', data=data)


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


class AboutWebsocketServerSchema(WebSocketServerSchema[AboutDataServerSchema]):
    """The schema used by the server to send server information data to clients."""

    def __init__(self, process: datetime | None) -> None:
        """Create a packet to send data about this server.

        Args:
            process (datetime | None): The process timestamp received by the client or
            None if no such timestamp was received.

        """
        super().__init__(type='about', data=AboutDataServerSchema(process=process))


class AboutDataClientSchema(ClientSchema):
    """Represent data received from clients requesting information about the server.

    The `process` field is optional. See `AboutDataServerSchema` for more information
    about its use.

    """

    process: datetime | None = None
