import asyncio
from typing import Final

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from .schemas import SyncSchema, WebSocketSchema

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
            data: SyncSchema = SyncSchema.model_validate_json(text)

            # Wrap the data in a websocket schema
            payload: WebSocketSchema = WebSocketSchema('sync', data)
            await websocket.send_text(payload.model_dump_json())
    except WebSocketDisconnect:
        pass  # TODO: log client disconnection
    except ValidationError:
        await websocket.close(1007)  # TODO: log error
    except Exception:
        await websocket.close(1011)  # TODO: log error
    finally:
        CLIENTS.discard(websocket)
