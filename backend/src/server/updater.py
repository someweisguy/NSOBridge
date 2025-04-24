from __future__ import annotations

import asyncio
from datetime import datetime
from typing import Any, Final, Literal
from uuid import UUID

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel

from model import JamId

type SeriesKey = tuple[Literal['series']]
type BoutKey = tuple[Literal['bout', 'timer'], UUID]
type JamKey = tuple[Literal['jam'], UUID, JamId]


type ObjectKey = SeriesKey | BoutKey | JamKey


class UpdateModel(BaseModel):
    key: ObjectKey
    data: Any
    timestamp: datetime

    def __eq__(self, other: UpdateModel) -> bool:
        return self.key == other.key

    def __hash__(self) -> int:
        return hash(self.key)


app: Final[FastAPI] = FastAPI()
background_tasks: Final[set[asyncio.Task]] = set()
updates: Final[set[UpdateModel]] = set()
clients: Final[set[WebSocket]] = set()


def post(key: ObjectKey, data: Any) -> None:
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


__all__ = ('app', 'broadcast', 'ObjectKey', 'post')
