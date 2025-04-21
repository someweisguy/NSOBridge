from typing import Final, Literal
from uuid import UUID

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from model import JamId

type ObjectKey = tuple[
    Literal['series'] | Literal['bout', 'timer'], UUID | Literal['jam'], UUID, JamId
]

router: Final[APIRouter] = APIRouter(prefix='/api')


clients: Final[set[WebSocket]] = set()


@router.websocket('/ws')
async def handle_socket(websocket: WebSocket) -> None:
    await websocket.accept()

    # Keep the connection open indefinitely
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        clients.discard(websocket)


async def generic_broadcast(key: ObjectKey, data) -> None:
    for client in clients:
        try:
            await client.send_json(
                {
                    'key': key,
                    'data': data,
                }
            )
        except Exception as e:
            print(f'Error sending message: {e}')
            clients.discard(client)
