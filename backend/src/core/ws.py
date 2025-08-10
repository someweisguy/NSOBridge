import asyncio
from typing import Final

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from schemas.ws import SyncSchema, WebSocketSchema

app: Final[FastAPI] = FastAPI()
clients: set[WebSocket] = set()
background_tasks: set[asyncio.Task[None]] = set()


@app.websocket('/')
async def handle_socket(websocket: WebSocket) -> None:
    await websocket.accept()
    clients.add(websocket)

    try:
        while True:
            # Get the payload and automatically add the server time in the response
            text: str = await websocket.receive_text()
            data: SyncSchema = SyncSchema.model_validate_json(text)

            # Wrap the data in a websocket schema
            payload: WebSocketSchema = WebSocketSchema(type='sync', data=data)
            await websocket.send_text(payload.model_dump_json())
    except WebSocketDisconnect:
        pass  # TODO: log client disconnection
    except ValidationError:
        await websocket.close(1007)  # TODO: log error
    except Exception:
        await websocket.close(1011)  # TODO: log error
    finally:
        clients.discard(websocket)


def broadcast(payload: str) -> None:
    for client in clients:
        task: asyncio.Task[None] = asyncio.create_task(client.send_json(payload))
        background_tasks.add(task)
        task.add_done_callback(background_tasks.discard)
