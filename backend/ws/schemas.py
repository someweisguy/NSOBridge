import os
from abc import ABC
from datetime import datetime
from typing import Any, Sequence

from models import CacheKey
from pydantic import Field, field_serializer
from schemas import ClientSchema, ServerSchema

type CacheServerSchema = Sequence[CacheKey]


class WebsocketClientSchema(ClientSchema):
    process: datetime | None = None


# TODO: documentation, see https://en.wikipedia.org/wiki/Cristian%27s_algorithm
class AboutDataSchema(ServerSchema):
    process: datetime | None
    server: datetime = Field(default_factory=datetime.now, init=False)
    version: str = Field(os.environ.get('VERSION', '0.0.0'), init=False)


class WebSocketServerSchema[T: Any](ServerSchema, ABC):
    type: str
    data: T

    @field_serializer('data')
    def _reject_null_data(self, data: Any | None) -> Any:
        if data is None:
            raise ValueError('Cannot send a Websocket packet without data')
        return data


class CacheWebsocketServerSchema(WebSocketServerSchema):
    def __init__(self, data: Sequence[CacheKey]) -> None:
        super().__init__(type='cache', data=data)


class AboutWebsocketServerSchema(WebSocketServerSchema):
    def __init__(self, process: datetime | None) -> None:
        super().__init__(type='about', data=AboutDataSchema(process=process))
