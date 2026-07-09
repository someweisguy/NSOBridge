"""The core app submodule."""

from typing import Callable, Final

from fastapi import HTTPException
from fastapi.exceptions import RequestValidationError

from .constants import timedelta_serializer
from .router import ASSETS, api_router, pages_router
from .schemas import CacheSchema, ClientSchema, ServerSchema
from .service import get_resource_path, register_model
from .types import APIResponse, CacheableProtocol, CacheKey
from .utils import (
    endpoint_profiling_middleware,
    generic_error_handler,
    validation_error_handler,
)

error_handlers: Final[dict[type[Exception], Callable]] = {
    Exception: generic_error_handler,
    HTTPException: generic_error_handler,
    RequestValidationError: validation_error_handler,
}
"""Default error handlers for the FastAPI application."""


__all__ = (
    'api_router',
    'APIResponse',
    'ASSETS',
    'CacheableProtocol',
    'CacheKey',
    'CacheSchema',
    'ClientSchema',
    'endpoint_profiling_middleware',
    'get_resource_path',
    'pages_router',
    'register_model',
    'timedelta_serializer',
    'ServerSchema',
)
