from __future__ import annotations

import asyncio
from typing import Any, Final, Literal
from uuid import UUID

from fastapi import WebSocket
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel

from model import JamId

type ObjectKey = tuple[
    Literal['series'] | Literal['bout', 'timer'], UUID | Literal['jam'], UUID, JamId
]


class UpdateModel(BaseModel):
    key: int
    data: Any

    def __eq__(self, other: UpdateModel) -> bool:
        return self.key == other.key


background_tasks: Final[set[asyncio.Task]] = set()
updates: Final[set[UpdateModel]] = set()
clients: Final[set[WebSocket]] = set()


def add_client(client: WebSocket) -> None:
    clients.add(client)


def remove_client(client: WebSocket) -> None:
    clients.discard(client)


def post(key: ObjectKey, data: Any) -> None:
    updates.add(UpdateModel(key=3, data=data))


def broadcast() -> int:
    num_updates: int = len(updates)
    if num_updates > 0:
        payload: Any = jsonable_encoder(updates)
        for client in clients:
            task: asyncio.Task = asyncio.create_task(client.send_json(payload))
            background_tasks.add(task)
            task.add_done_callback(background_tasks.discard)
        updates.clear()
    return num_updates


__all__ = ('add_client', 'remove_client', 'post', 'broadcast', 'ObjectKey')
