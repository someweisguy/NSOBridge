from datetime import datetime
from typing import Any, Literal

from pydantic import Field, field_serializer, field_validator
from schemas import ClientSchema, ServerSchema


class WebSocketSchema(ServerSchema):
    type: Literal['cache', 'sync']
    data: Any | None

    def __init__(
        self, data_type: Literal['cache', 'sync'], data: Any | None = None
    ) -> None:
        super().__init__(type=data_type, data=data)  # ty: ignore[unknown-argument]

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

    @field_serializer('server', mode='plain')
    @classmethod
    def _serialize_server(cls, value: datetime) -> str:
        # This method is required to silence Pydantic serialization warnings
        return value.isoformat()
