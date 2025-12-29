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
async def _handle_socket(websocket: WebSocket) -> None:
    await websocket.accept()
    CLIENTS.add(websocket)

    try:
        while True:
            request: WebsocketClientSchema = WebsocketClientSchema.model_validate_json(
                await websocket.receive_text()
            )
            response: WebSocketServerSchema = AboutWebsocketServerSchema(
                request.process
            )
            await websocket.send_text(response.model_dump_json())
    except WebSocketDisconnect:
        pass  # TODO: log client disconnection
    except ValidationError:
        await websocket.close(1007)  # TODO: log error
    except Exception:
        await websocket.close(1011)  # TODO: log error
    finally:
        CLIENTS.discard(websocket)
