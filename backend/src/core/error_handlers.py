"""FastAPI error handlers methods."""

from __future__ import annotations

import logging
from http import HTTPStatus
from typing import TYPE_CHECKING, Callable, Final

from fastapi.exceptions import RequestValidationError

from .exceptions import ClientError, ModelLookupError
from .response import APIResponse
from .schemas.api import ErrorSchema

if TYPE_CHECKING:
    from fastapi import Request


logging.getLogger('aiosqlite').setLevel(logging.CRITICAL)


async def _generic_error_handler(request: Request, e: Exception) -> APIResponse:
    error: ErrorSchema = ErrorSchema(type=type(e).__name__, message=str(e))

    # Handle exceptions that weren't explicitly caught
    if not isinstance(e, ClientError):
        logging.error(f'An unexpected "{error.type}" error occurred: {error.message}')
        return APIResponse(error, status_code=HTTPStatus.INTERNAL_SERVER_ERROR)

    # Determine the HTTP status code based on the exception type
    match e:
        case ModelLookupError():
            status_code = HTTPStatus.NOT_FOUND
        case _:
            status_code = HTTPStatus.CONFLICT

    logging.info(f'{error.message} (HTTP {status_code})')

    return APIResponse(error, status_code=status_code)


async def _validation_error_handler(
    request: Request, e: RequestValidationError
) -> APIResponse:
    error: ErrorSchema = ErrorSchema(type=type(e).__name__, message=(str(e)))
    logging.warning(f'Received invalid input: {str(e)}')
    return APIResponse(error, status_code=HTTPStatus.BAD_REQUEST)


error_handlers: Final[dict[type[Exception], Callable]] = {
    Exception: _generic_error_handler,
    ClientError: _generic_error_handler,
    RequestValidationError: _validation_error_handler,
}
