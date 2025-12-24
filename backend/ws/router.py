import asyncio
from typing import Final

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from .schemas import (
    AboutWebsocketServerSchema,
    WebsocketClientSchema,
    WebSocketServerSchema,
)

app: Final[FastAPI] = FastAPI()


CLIENTS: set[WebSocket] = set()
BACKGROUND_TASKS: set[asyncio.Task[None]] = set()


@app.websocket('/')
async def handle_socket(websocket: WebSocket) -> None:
    await websocket.accept()
    CLIENTS.add(websocket)

    try:
        while True:
            # Get the payload and automatically add the server time in the response
            text: str = await websocket.receive_text()
            try:
                request: WebsocketClientSchema = (
                    WebsocketClientSchema.model_validate_json(text)
                )
            except ValidationError:
                request = WebsocketClientSchema(process=None)

            # Generate and send a response
            response: WebSocketServerSchema = AboutWebsocketServerSchema(
                request.process
            )
            await websocket.send_text(response.model_dump_json())
    except WebSocketDisconnect:
        pass  # TODO: log client disconnection
    except (ValidationError, Exception):
        await websocket.close(1011)  # TODO: log error
    finally:
        CLIENTS.discard(websocket)
