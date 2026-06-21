"""Utilities for use in the core application."""

from __future__ import annotations

import logging
import time
from http import HTTPStatus
from typing import TYPE_CHECKING, Awaitable, Callable

from core.exceptions import ClientError, ModelLookupError
from core.responses import APIResponse

from .schemas import ErrorSchema

if TYPE_CHECKING:
    from fastapi import Request, Response
    from fastapi.exceptions import RequestValidationError

logging.getLogger('aiosqlite').setLevel(logging.CRITICAL)


async def endpoint_profiling_middleware(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Response:
    """Log the amount of time that an endpoint takes to process.

    Logs the number of milliseconds that it took for an endpoint to complete. If an
    endpoint takes less than a specified number of milliseconds to complete, it is not
    logged.

    Args:
        request (Request): The FastAPI Request.
        call_next (Callable[[Request], Awaitable[Response]]): The next middleware or
        endpoint to call.

    Returns:
        Response: the endpoint response.

    """
    threshold_milliseconds: float = 200
    start_time: float = time.perf_counter()
    response: Response = await call_next(request)
    process_time: float = round((time.perf_counter() - start_time) * 1000, 3)
    if process_time >= threshold_milliseconds:
        logging.warning(
            f'{request.method} {request.url.path} took {process_time}ms to complete'
        )
    return response


async def generic_error_handler(request: Request, e: Exception) -> APIResponse:
    """Handle generic errors in FastAPI."""
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


async def validation_error_handler(
    request: Request, e: RequestValidationError
) -> APIResponse:
    """Handle Pydantic validation errors in FastAPI."""
    error: ErrorSchema = ErrorSchema(type=type(e).__name__, message=(str(e)))
    logging.warning(f'Received invalid input: {str(e)}')
    return APIResponse(error, status_code=HTTPStatus.BAD_REQUEST)
