import asyncio
from datetime import datetime, timedelta
from typing import Any, Final
from uuid import UUID, uuid4

from fastapi import Request, Response, WebSocket, WebSocketDisconnect

from .fastapi import app

CLIENT_ID_COOKIE_NAME: Final[str] = 'client_id'
clients: Final[dict[UUID, WebSocket]] = {}
background_tasks: Final[set[asyncio.Task]] = set()


@app.middleware('http')
async def assign_client_id_middleware(request: Request, call_next) -> Response:
    response: Response = await call_next(request)

    # Check for client ID cookie and set it if not present
    try:
        UUID(request.cookies.get(CLIENT_ID_COOKIE_NAME))
    except (TypeError, ValueError):
        response.set_cookie(CLIENT_ID_COOKIE_NAME, str(uuid4()), expires=86400)

    return response


@app.middleware('http')
async def update_views_middleware(request: Request, call_next) -> Response:
    response: Response = await call_next(request)

    if request.method != 'GET':
        client_id: UUID | None = request.cookies.get(CLIENT_ID_COOKIE_NAME)
        for socket in [s for u, s in clients.items() if u != client_id]:
            # Don't use a TaskGroup so the Response can be returned earlier
            task: asyncio.Task = asyncio.create_task(socket.send_json(response.body))
            background_tasks.add(task)  # Prevents task from being GC'd
            task.add_done_callback(background_tasks.discard)

    return response


@app.websocket('/ws')
async def handle_socket(websocket: WebSocket) -> None:
    await websocket.accept()
    
    try:
        client_id: UUID = UUID(websocket.cookies.get(CLIENT_ID_COOKIE_NAME))
    except (TypeError, ValueError):
        client_id: UUID = uuid4()
    clients[client_id] = websocket

    last_request: datetime = datetime.min

    while True:
        try:
            await websocket.receive_text()
            now: datetime = datetime.now()

            if now - last_request < timedelta(seconds=5):
                continue  # Ignore excessive requests

            PAYLOAD: Final[dict[str, Any]] = {
                'event': 'syncResponse',
                'data': {'t1': now.isoformat(), 't2': datetime.now().isoformat()},
                'objectsUpdated': [],
                'timestamp': now.isoformat(),
                'actor': str(client_id),
            }

            await websocket.send_json(PAYLOAD)
            last_request = now
        except WebSocketDisconnect:
            del clients[client_id]
            return
