from __future__ import annotations

import asyncio
from datetime import datetime
from typing import Any, Final, Literal
from uuid import UUID

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.encoders import jsonable_encoder
from model import JamId
from pydantic import BaseModel

from server import JSONable

type UpdateKey = (
    tuple[Literal['series']]  # Series updates
    | tuple[Literal['bout', 'timer'], UUID]  # Bout or Timer updates
    | tuple[Literal['jam'], UUID, JamId]  # Jam updates
)


class UpdateModel(BaseModel):
    key: UpdateKey
    data: Any
    timestamp: datetime
    actor: UUID | None = None

    def __eq__(self, other: UpdateModel) -> bool:
        return self.key == other.key

    def __hash__(self) -> int:
        return hash(self.key)


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
updates: set[UpdateModel] = set()
background_tasks: set[asyncio.Task] = set()


def post(key: UpdateKey, data: JSONable) -> None:
    now: datetime = datetime.now()
    updates.add(UpdateModel(key=key, data=data, timestamp=now))


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
