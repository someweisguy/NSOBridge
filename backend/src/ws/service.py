"""Services for the WebSocket module including the sub-application and methods."""

import asyncio
import logging
from typing import TYPE_CHECKING, Final

from core import get_updated_cache_items
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import ValidationError
from sqlalchemy import event
from sqlalchemy.orm import Session
from websockets import CloseCode

from .schemas import (
    AboutDataClientSchema,
    AboutWebsocketServerSchema,
    CacheWebsocketServerSchema,
    WebSocketServerSchema,
)

if TYPE_CHECKING:
    from core import CacheKey


_clients: set[WebSocket] = set()
_background_tasks: set[asyncio.Task[None]] = set()


app: Final[FastAPI] = FastAPI()


@app.websocket('/')
async def _handle_socket(websocket: WebSocket) -> None:
    """Handle all connecting WebSockets.

    Args:
        websocket (WebSocket): the incoming WebSocket.

    """
    # Connect to the incoming socket
    logging.debug('Accepting WebSocket client')
    await websocket.accept()
    _clients.add(websocket)

    try:
        # Handle incoming socket packet data and send a response
        while True:
            # There is only one type of packet which should be received
            request: AboutDataClientSchema = AboutDataClientSchema.model_validate_json(
                await websocket.receive_text()
            )
            response: WebSocketServerSchema = AboutWebsocketServerSchema(
                request.process
            )
            await websocket.send_text(response.model_dump_json())
    except WebSocketDisconnect:
        logging.debug('WebSocket client disconnected')
    except ValidationError as e:
        logging.info('closing WebSocket due to invalid data received')
        await websocket.close(CloseCode.INVALID_DATA, str(e))
    except Exception as e:
        logging.error('an unhandled WebSocket exception occurred, closing socket')
        await websocket.close(CloseCode.INTERNAL_ERROR, str(e))
    finally:
        _clients.discard(websocket)


@event.listens_for(Session, 'before_commit')
def _handle_dirty_session(session: Session) -> None:
    cache_keys: list[CacheKey] = [
        model.cache_key() for model in get_updated_cache_items(session)
    ]
    if len(cache_keys) == 0:
        return

    # Generate and send the payload to all clients
    logging.debug(f'Invalidating cache keys: {str(cache_keys)}')
    payload: str = CacheWebsocketServerSchema(cache_keys).model_dump_json()
    for client in _clients:
        # SQLAlchemy events do not support async methods so a task is needed
        task: asyncio.Task[None] = asyncio.create_task(client.send_text(payload))
        task.add_done_callback(_background_tasks.discard)
        _background_tasks.add(task)


async def disconnect_all(code: int, reason: str) -> None:
    """Disconnect all the WebSocket clients.

    Args:
        code (int): the WebSocket disconnect code.
        reason (str): the reason for the disconnection.

    """
    for client in _clients:
        await client.close(code=code, reason=reason)
