import asyncio
from typing import Final, Iterable

from core import BaseSQLModel, db
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from game import CacheableSQLModel
from pydantic import ValidationError
from websockets import CloseCode

from .schemas import (
    AboutDataClientSchema,
    AboutWebsocketServerSchema,
    CacheWebsocketServerSchema,
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
            request: AboutDataClientSchema = AboutDataClientSchema.model_validate_json(
                await websocket.receive_text()
            )
            response: WebSocketServerSchema = AboutWebsocketServerSchema(
                request.process
            )
            await websocket.send_text(response.model_dump_json())
    except WebSocketDisconnect:
        pass  # TODO: log client disconnection
    except ValidationError as e:
        await websocket.close(CloseCode.INVALID_DATA, str(e))  # TODO: log error
    except Exception as e:
        await websocket.close(CloseCode.INTERNAL_ERROR, str(e))  # TODO: log error
    finally:
        _clients.discard(websocket)


def invalidate_queries(models: Iterable[BaseSQLModel]) -> None:
    """Invalidate client queries pertaining to the provided models.

    This method is typically only used handle a list of models which have just been
    updated. The parent of each model is fetched and added to this list. The list is
    then deduplicated and each model's cache key is sent to each client. This allows
    clients to refetch new data and update their cache.

    Args:
        models (Iterable[BaseSQLModel]): a list of models which should be invalided.

    """

    async def send_model_tree_updates(models: Iterable[BaseSQLModel]) -> None:
        async with db.get_async_session() as session:
            # Merge the models with the current session
            models = [await session.merge(model) for model in models]
            # Get a set of the cacheable models from all the updated models
            cacheables: set[CacheableSQLModel] = {
                model for model in models if isinstance(model, CacheableSQLModel)
            }
            for model in models:
                cacheables |= {
                    parent
                    for parent in await model.get_parents()
                    if isinstance(parent, CacheableSQLModel)
                }
            if len(cacheables) == 0:
                return

            # Generate the payload to broadcast
            payload = CacheWebsocketServerSchema(
                [
                    cacheable.cache_key()
                    for cacheable in cacheables
                    if cacheable.id is not None
                ]
            )

        # Send the payload to all clients
        for client in _clients:
            await client.send_text(payload.model_dump_json())

    task: asyncio.Task[None] = asyncio.create_task(send_model_tree_updates(models))
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
