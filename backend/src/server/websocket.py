from datetime import datetime, timedelta
from typing import Any, Final
from uuid import UUID, uuid4

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from .utils import CLIENT_ID_COOKIE_NAME

clients: Final[dict[UUID, WebSocket]] = {}
router: Final[APIRouter] = APIRouter()


@router.websocket('/ws')
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


__all__ = 'clients', 'router'
