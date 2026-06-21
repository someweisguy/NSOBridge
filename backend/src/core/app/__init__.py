"""The core app submodule."""

from typing import Callable, Final

from fastapi.exceptions import RequestValidationError

from core.exceptions import ClientError

from .service import get_resource_path
from .utils import (
    endpoint_profiling_middleware,
    generic_error_handler,
    validation_error_handler,
)
from .ws import send_all

error_handlers: Final[dict[type[Exception], Callable]] = {
    Exception: generic_error_handler,
    ClientError: generic_error_handler,
    RequestValidationError: validation_error_handler,
}


__all__ = (
    'endpoint_profiling_middleware',
    'get_resource_path',
    'send_all',
)
