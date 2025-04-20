import asyncio
from typing import Callable, Final, Literal
from uuid import UUID

from fastapi import APIRouter, Request, Response, WebSocket, WebSocketDisconnect

from model import JamId

from .api.v1.getters import GETTER_REGISTRY
from .fastapi import app

type ObjectKey = tuple[
    Literal['series'] | Literal['bout', 'timer'], UUID | Literal['jam'], UUID, JamId
]

router: Final[APIRouter] = APIRouter()

clients: Final[set[WebSocket]] = set()
background_tasks: Final[set[asyncio.Task]] = set()
updates: set = set()


def push(object_key: ObjectKey) -> None:
    updates.add(object_key)


@app.middleware('http')
async def update_views_middleware(request: Request, call_next) -> Response:
    response: Response = await call_next(request)

    while len(updates) > 0:
        key, *args = updates.pop()
        getter: Callable | None = GETTER_REGISTRY.get(key)
        if getter is None:
            continue

        view: dict[str, ...] = getter(*args)

        for socket in clients:
            # Don't use a TaskGroup so the Response can be returned earlier
            task: asyncio.Task = asyncio.create_task(socket.send_json(view))
            background_tasks.add(task)  # Prevent task from being GC'd
            task.add_done_callback(background_tasks.discard)

    return response


@router.websocket('/ws')
async def handle_socket(websocket: WebSocket) -> None:
    await websocket.accept()

    # Keep the connection open indefinitely
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        clients.discard(websocket)


__all__ = 'push', 'router'
