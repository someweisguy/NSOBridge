"""Business logic for the core application."""

from __future__ import annotations

import asyncio
import logging
import os
import sys
from pathlib import Path
from typing import TYPE_CHECKING, Any, Callable, Final, Type

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import ValidationError
from websockets import CloseCode

from .schemas import (
    AboutDataClientSchema,
    AboutWebsocketServerSchema,
    WebSocketServerSchema,
)
from .types import CacheableProtocol

if TYPE_CHECKING:
    from .schemas import ServerSchema


_model_table: Final[dict[Any, Type[ServerSchema]]] = {}
"""Maps app models to their corresponding Pydantic schema."""

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


def send_all[T: Any](message_type: str, data: T) -> None:
    """Send a WebSocket payload to all clients.

    Args:
       message_type (str): the message type to send to all clients.
       data (T: Any): the message data to send to all clients.

    """
    payload: str = WebSocketServerSchema(type=message_type, data=data).model_dump_json()
    for client in _clients:
        task = asyncio.create_task(client.send_text(payload))
        task.add_done_callback(_background_tasks.discard)
        _background_tasks.add(task)


def get_resource_path(relative_path: str) -> Path:
    """Get absolute path to resource, works for dev and for pyinstaller.

    Args:
        relative_path (str): the relative path of the desired resource.

    Returns:
        Path: a path to the resource.

    """
    base_path: str | Path = getattr(sys, '_MEIPASS', Path.cwd())
    return Path(os.path.join(base_path, relative_path))


def register_model(model: Any) -> Callable:
    """Register a model to be associated with the decorated Pydantic schema.

    This method also registers all the subclasses of the model, if the model implements
    subclasses.

    Use as a decorator for Pydantic schemas to allow models to be dynamically
    serialized. This is needed because FastAPI doesn't natively know how to serialize
    models unless explicitly told how.

    Args:
        cls (Type[ServerSchema]): the Pydantic schema.
        model (Any): the associated model.

    """
    if not isinstance(model, CacheableProtocol):
        raise TypeError('Only cacheable models should be registered.')

    def _schema_decorator(cls: Type[ServerSchema]):
        _model_table[model] = cls
        for subclass in model.__subclasses__():
            _model_table[subclass] = cls
        return cls

    return _schema_decorator


def get_schema(model: Any) -> Type[ServerSchema]:
    """Get the schema registered to the desired model.

    This method automatically checks if the base class of the model has been registered
    to the model-schema lookup table. If it has, it associates the child class with its
    parent's schema. This is used for different rulesets so that a single schema may be
    associated with all ruleset class definitions.

    This method is the inverse of the `register model` decorator.

    Args:
        model (Any): the model registered to a schema.

    Raises:
        ValueError: if no such model has been registered to a schema.

    Returns:
        Type[ServerSchema]: the registered schema.

    """
    schema: Type[ServerSchema] | None = _model_table.get(model, None)

    # Dynamically add sub-classes to the lookup table
    if schema is None and issubclass(model, tuple(_model_table.keys())):
        for parent_class in model.__bases__:
            schema = _model_table.get(parent_class, None)
            if schema is not None:
                _model_table[model] = schema
                break

    if schema is None:
        raise ValueError(
            f'Found unregistered model: {model}. Was the model passed by type?'
        )
    return schema
