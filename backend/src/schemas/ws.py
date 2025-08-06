from datetime import datetime
from typing import Any, Literal

from pydantic import Field, field_serializer, field_validator

from schemas.schemas import ClientSchema, ServerSchema


class WebsocketSchema(ServerSchema):
    type: Literal['sync', 'update']
    data: Any | None = None

    @field_serializer('data')
    def _reject_null_data(self, data: Any | None) -> Any:
        if data is None:
            raise ValueError('Cannot send a Websocket packet without data')
        return data


# TODO: documentation, see https://en.wikipedia.org/wiki/Cristian%27s_algorithm
class SyncSchema(ClientSchema):
    process: datetime
    server: datetime = Field(default_factory=datetime.now)

    @field_validator('server', mode='plain')
    @classmethod
    def _reject_server_field(cls, value: Any) -> Any:
        # Prevents the client from providing a 'server' field
        raise ValueError(f'Clients cannot provide a server datetime ({value=})')
