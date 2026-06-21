"""The core app submodule."""

from typing import Callable, Final

from fastapi.exceptions import RequestValidationError

from core.exceptions import ClientError

from .schemas.api import APIResponse
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


__all__ = ('APIResponse', 'endpoint_profiling_middleware', 'send_all')
