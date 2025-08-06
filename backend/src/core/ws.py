import asyncio
from typing import Final

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from schemas.time import ProcessTimeSchema

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
            payload: ProcessTimeSchema = ProcessTimeSchema.model_validate_json(
                await websocket.receive_text()
            )
            await websocket.send_text(payload.model_dump_json())
    except WebSocketDisconnect:
        pass  # TODO: log client disconnection
    except ValidationError:
        pass  # TODO
    clients.discard(websocket)


def broadcast(payload: str) -> None:
    for client in clients:
        task: asyncio.Task[None] = asyncio.create_task(client.send_json(payload))
        background_tasks.add(task)
        task.add_done_callback(background_tasks.discard)
