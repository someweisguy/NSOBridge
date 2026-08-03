"""The core app submodule."""

from collections.abc import Callable, Coroutine
from typing import Any, Final

from fastapi import HTTPException, Request, Response
from fastapi.exceptions import RequestValidationError

from .constants import timedelta_serializer
from .router import ASSETS, api_router, pages_router
from .schemas import ClientSchema, ServerSchema
from .service import disconnect_all, get_resource_path, register_model, ws
from .types import CacheableProtocol, CacheKey
from .utils import (
    endpoint_profiling_middleware,
    generic_error_handler,
    validation_error_handler,
)

error_handlers: Final[
    dict[int | type[Exception], Callable[[Request, Any], Coroutine[Any, Any, Response]]]
    | None
] = {
    Exception: generic_error_handler,
    HTTPException: generic_error_handler,
    RequestValidationError: validation_error_handler,
}
"""Default error handlers for the FastAPI application."""


__all__ = (
    'ASSETS',
    'CacheKey',
    'CacheableProtocol',
    'ClientSchema',
    'ServerSchema',
    'api_router',
    'disconnect_all',
    'endpoint_profiling_middleware',
    'get_resource_path',
    'pages_router',
    'register_model',
    'timedelta_serializer',
    'ws',
)
