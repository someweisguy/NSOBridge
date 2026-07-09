"""Utilities for use in the core application."""

from __future__ import annotations

import logging
import time
from http import HTTPStatus
from typing import TYPE_CHECKING, Awaitable, Callable

from fastapi import HTTPException

from .schemas import ErrorSchema
from .types import APIResponse

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
    threshold_milliseconds: float = 500
    start_time: float = time.perf_counter()
    response: Response = await call_next(request)
    process_time: float = round((time.perf_counter() - start_time) * 1000, 3)
    if process_time >= threshold_milliseconds:
        logging.warning(
            f'{request.method} {request.url.path} took {process_time}ms to complete'
        )
    return response


async def generic_error_handler(request: Request, e: Exception) -> Response:
    """Handle generic errors in FastAPI."""
    if not isinstance(e, HTTPException):
        logging.warning(f'An unhandled exception occurred: {type(e).__name__}')
        logging.info(e)
        return APIResponse(e, status_code=HTTPStatus.INTERNAL_SERVER_ERROR)

    logging.info(f'Handling bad request: {e.detail} (HTTP {e.status_code})')
    return APIResponse(e.detail, status_code=e.status_code)


async def validation_error_handler(
    request: Request, e: RequestValidationError
) -> Response:
    """Handle Pydantic validation errors in FastAPI."""
    error: ErrorSchema = ErrorSchema(type=type(e).__name__, message=(str(e)))
    logging.warning(f'Received invalid input: {str(e)}')
    return APIResponse(error, status_code=HTTPStatus.UNPROCESSABLE_ENTITY)
