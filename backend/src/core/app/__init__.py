"""The core app submodule."""

from typing import Callable, Final

from fastapi.exceptions import RequestValidationError

from core.exceptions import ClientError

from .constants import timedelta_serializer
from .router import api_router, assets, pages_router
from .schemas import ClientSchema, ServerSchema
from .service import APIResponse, get_resource_path
from .utils import (
    endpoint_profiling_middleware,
    generic_error_handler,
    validation_error_handler,
)

error_handlers: Final[dict[type[Exception], Callable]] = {
    Exception: generic_error_handler,
    ClientError: generic_error_handler,
    RequestValidationError: validation_error_handler,
}


__all__ = (
    'api_router',
    'APIResponse',
    'assets',
    'ClientSchema',
    'endpoint_profiling_middleware',
    'get_resource_path',
    'pages_router',
    'timedelta_serializer',
    'ServerSchema',
)
