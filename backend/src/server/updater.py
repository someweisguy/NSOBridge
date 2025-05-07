from __future__ import annotations

import asyncio
from typing import Any, Final, Literal
from uuid import UUID

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.encoders import jsonable_encoder

type UpdateKey = (
    tuple[Literal['series']]  # Series updates
    | tuple[Literal['bout'], UUID]  # Bout updates
    | tuple[Literal['jam'], UUID, int, int]  # Jam updates
)


app: Final[FastAPI] = FastAPI()


@app.websocket('/updates')
async def handle_socket(websocket: WebSocket) -> None:
    await websocket.accept()
    clients.add(websocket)

    # Keep the connection open indefinitely
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        clients.discard(websocket)


clients: set[WebSocket] = set()
updates: set[UpdateKey] = set()
background_tasks: set[asyncio.Task] = set()


def post(key: UpdateKey) -> None:
    updates.add(key)


def broadcast() -> int:
    num_updates: int = len(updates)
    if num_updates > 0:
        payload: Any = jsonable_encoder(list(updates))
        for client in clients:
            task: asyncio.Task = asyncio.create_task(client.send_json(payload))
            background_tasks.add(task)
            task.add_done_callback(background_tasks.discard)
        updates.clear()
    return num_updates


__all__ = ('app', 'broadcast', 'post', 'UpdateKey')
