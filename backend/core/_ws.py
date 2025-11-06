import asyncio
from datetime import datetime
from typing import Any, Final, Literal

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import Field, ValidationError, field_serializer, field_validator

from ._schemas import ClientSchema, ServerSchema

ws_app: Final[FastAPI] = FastAPI()
clients: set[WebSocket] = set()
background_tasks: set[asyncio.Task[None]] = set()


class WebSocketSchema(ServerSchema):
    type: Literal['cache', 'sync']
    data: Any | None

    def __init__(
        self, payload_type: Literal['cache', 'sync'], data: Any | None = None
    ) -> None:
        super().__init__(type=payload_type, data=data)  # pyright: ignore[reportCallIssue]

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


@ws_app.websocket('/')
async def handle_socket(websocket: WebSocket) -> None:
    await websocket.accept()
    clients.add(websocket)

    try:
        while True:
            # Get the payload and automatically add the server time in the response
            text: str = await websocket.receive_text()
            data: SyncSchema = SyncSchema.model_validate_json(text)

            # Wrap the data in a websocket schema
            payload: WebSocketSchema = WebSocketSchema('sync', data)
            await websocket.send_text(payload.model_dump_json())
    except WebSocketDisconnect:
        pass  # TODO: log client disconnection
    except ValidationError:
        await websocket.close(1007)  # TODO: log error
    except Exception:
        await websocket.close(1011)  # TODO: log error
    finally:
        clients.discard(websocket)


def broadcast(payload: WebSocketSchema) -> None:
    for client in clients:
        task = asyncio.create_task(client.send_text(payload.model_dump_json()))
        task.add_done_callback(background_tasks.discard)
        background_tasks.add(task)
