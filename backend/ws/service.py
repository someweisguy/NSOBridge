import asyncio
from typing import Final, Iterable

from core.models import BaseSQLModel
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from game.models import CacheableSQLModel
from pydantic import ValidationError

from .schemas import (
    AboutWebsocketServerSchema,
    CacheWebsocketServerSchema,
    WebsocketClientSchema,
    WebSocketServerSchema,
)

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
    await websocket.accept()
    _clients.add(websocket)

    try:
        # Handle incoming socket packet data and send a response
        while True:
            # There is only one type of packet which should be received
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
        # TODO: remove magic number
        await websocket.close(1007)  # TODO: log error
    except Exception:
        # TODO: remove magic number
        await websocket.close(1011)  # TODO: log error
    finally:
        _clients.discard(websocket)


# TODO: delete this comment block
# @event.listens_for(Session, 'before_commit')
# def _broadcast_updates(session: Session) -> None:
#     # Recursively add each dirty, deleted, or new model
#     cacheables: set[CacheableSQLModel] = {
#         parent
#         for model in [
#             record
#             for identity_map in [session.dirty, session.deleted, session.new]
#             for record in identity_map
#             if isinstance(record, BaseSQLModel)
#         ]
#         for parent in model.search_parents() | {model}
#         if isinstance(parent, CacheableSQLModel)
#     }

#     # Broadcast model keys of all updated cacheable models to clients
#     payload = CacheWebsocketServerSchema(
#         [cacheable.cache_key() for cacheable in cacheables if cacheable.id is not None]
#     )
#     if len(payload.data) > 0:
#         broadcast(payload)


# TODO: remove this method
def broadcast(payload: WebSocketServerSchema) -> None:
    for client in _clients:
        task: asyncio.Task[None] = asyncio.create_task(
            client.send_text(payload.model_dump_json())
        )
        task.add_done_callback(_background_tasks.discard)
        _background_tasks.add(task)


async def _unpack_updates(models: Iterable[BaseSQLModel]) -> None:
    # Get a set of the cacheable models from all the updated models
    cacheables: set[CacheableSQLModel] = {
        parent
        for model in models
        for parent in model.search_parents() | {model}
        if isinstance(parent, CacheableSQLModel)
    }

    # TODO: generate the payload to broadcast

    # TODO: send the payload to all clients
    # FIXME: use task group for this?
    for client in _clients:
        task: asyncio.Task[None] = asyncio.create_task(
            client.send_text(payload.model_dump_json())
        )
        task.add_done_callback(_background_tasks.discard)
        _background_tasks.add(task)


def broadcast_updates(models: BaseSQLModel | Iterable[BaseSQLModel]) -> None:
    if not isinstance(models, Iterable):
        models = [models]
    task: asyncio.Task[None] = asyncio.create_task(_unpack_updates(models))
    task.add_done_callback(_background_tasks.discard)
    _background_tasks.add(task)


async def disconnect_all(reason: str) -> None:
    for client in _clients:
        await client.close(code=1000, reason=reason)
