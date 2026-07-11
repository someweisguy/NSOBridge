"""Core application schemas."""

from __future__ import annotations

from abc import ABC
from datetime import datetime
from typing import TYPE_CHECKING, Any, ClassVar

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_serializer,
)
from pydantic.alias_generators import to_camel

if TYPE_CHECKING:
    from uuid import UUID


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


class ErrorSchema(ServerSchema):
    """A schema for returning detailed error messages to clients."""

    type: str
    message: str


class VersionSchema(ServerSchema):
    """The schema which returns application version information."""

    version: str


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


class AboutDataClientSchema(ClientSchema):
    """Represent data received from clients requesting information about the server.

    The `process` field is optional. See `AboutDataServerSchema` for more information
    about its use.

    """

    process: datetime | None = None


class WebSocketServerSchema[T: Any](ServerSchema, ABC):
    """The base schema used by the server to send data to clients."""

    type: str
    data: T
    transaction_uuid: UUID | None = Field(None, exclude_if=lambda u: u is None)

    @field_serializer('data')
    def _reject_null_data(self, data: Any | None) -> Any:
        if data is None:
            raise ValueError('Cannot send a Websocket packet without data')
        return data


class AboutWebsocketServerSchema(WebSocketServerSchema[AboutDataServerSchema]):
    """The schema used by the server to send server information data to clients."""

    def __init__(self, process: datetime | None) -> None:
        """Create a packet to send data about this server.

        Args:
            process (datetime | None): The process timestamp received by the client or
            None if no such timestamp was received.

        """
        super().__init__(type='about', data=AboutDataServerSchema(process=process))
