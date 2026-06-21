"""Services for the WebSocket module including the sub-application and methods."""

import asyncio
import logging
from typing import Any, Final

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import ValidationError
from websockets import CloseCode

from .schemas import (
    AboutDataClientSchema,
    AboutWebsocketServerSchema,
    WebSocketServerSchema,
)

_clients: set[WebSocket] = set()
_background_tasks: set[asyncio.Task[None]] = set()


ws: Final[FastAPI] = FastAPI()


@ws.websocket('/')
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


async def disconnect_all(code: int, reason: str) -> None:
    """Disconnect all the WebSocket clients.

    Args:
        code (int): the WebSocket disconnect code.
        reason (str): the reason for the disconnection.

    """
    for client in _clients:
        await client.close(code=code, reason=reason)


async def send_all[T: Any](message_type: str, data: T) -> None:
    """Send a WebSocket payload to all clients.

    Args:
       message_type (str): the message type to send to all clients.
       data (T: Any): the message data to send to all clients.

    """
    payload: str = WebSocketServerSchema(type=message_type, data=data).model_dump_json()
    for client in _clients:
        await client.send_text(payload)
