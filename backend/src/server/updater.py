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


class KeyFactory:
    _instance: KeyFactory | None = None

    def __init__(self) -> None:
        if KeyFactory._instance is not None:
            raise RuntimeError('This class cannot be initialized')
        KeyFactory._instance = self

    @classmethod
    def series(cls) -> UpdateKey:
        return ('series',)

    @classmethod
    def bout(cls, uuid: UUID) -> UpdateKey:
        return ('bout', uuid)

    @classmethod
    def jam(cls, uuid: UUID, period_num: int, jam_num: int) -> UpdateKey:
        return ('jam', uuid, period_num, jam_num)


app: Final[FastAPI] = FastAPI()
kf: Final[KeyFactory] = KeyFactory()


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


def post(key: UpdateKey | list[UpdateKey]) -> None:
    if isinstance(key, list):
        updates.update(key)
    else:
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


__all__ = ('app', 'broadcast', 'kf', 'post', 'UpdateKey')
