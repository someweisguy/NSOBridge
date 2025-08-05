import asyncio
from typing import Final

from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app: Final[FastAPI] = FastAPI()
clients: set[WebSocket] = set()
background_tasks: set[asyncio.Task[None]] = set()


@app.websocket('/updates')
async def handle_socket(websocket: WebSocket) -> None:
    await websocket.accept()
    clients.add(websocket)

    # Keep the connection open indefinitely
    try:
        while True:
            # TODO: Handle time synchronization
            await websocket.receive_text()
    except WebSocketDisconnect:
        clients.discard(websocket)


def broadcast(payload: str) -> None:
    for client in clients:
        task: asyncio.Task[None] = asyncio.create_task(client.send_json(payload))
        background_tasks.add(task)
        task.add_done_callback(background_tasks.discard)
