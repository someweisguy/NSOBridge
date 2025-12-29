"""Schemas used in the WebSocket module."""

import os
from abc import ABC
from datetime import datetime
from typing import Any, Sequence

from core import ClientSchema, ServerSchema
from game import CacheKey
from pydantic import Field, field_serializer

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
    on this server. The `version` field is the current application version.

    The `process` and `server` fields are provided to allow clients to synchronize game
    clocks with the server. To do so, Cristian's algorithm is used. To learn more about
    Cristian's algorithm, see: https://en.wikipedia.org/wiki/Cristian%27s_algorithm

    """

    process: datetime | None
    server: datetime = Field(default_factory=datetime.now, init=False)
    version: str = Field(os.environ.get('VERSION', '0.0.0'), init=False)


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
