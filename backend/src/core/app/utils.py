"""Utilities for use in the core application."""

from __future__ import annotations

import json
import logging
import time
from datetime import datetime
from http import HTTPStatus
from typing import TYPE_CHECKING, Any, Awaitable, Callable, override
from uuid import UUID, uuid4

from fastapi import HTTPException
from fastapi.responses import JSONResponse
from pydantic import (
    Field,
    ModelWrapValidatorHandler,
    model_validator,
)

from .schemas import ErrorSchema, ServerSchema
from .service import get_schema, send_all
from .types import CacheableProtocol, CacheKey

if TYPE_CHECKING:
    from fastapi import Request, Response
    from fastapi.exceptions import RequestValidationError

logging.getLogger('aiosqlite').setLevel(logging.CRITICAL)


class CacheSchema[T: ServerSchema](ServerSchema):
    """A special schema that renders cache updates.

    This schema is designed to take an object which implements the Cacheable Protocol
    and convert it to a schema with a validated data field as well as a validated cache
    field. This schema will also work if a dict with a `cache` key is passed and the
    value is a list of cacheable models.

    If the provided data is not cacheable, it is serialized with the default handler.
    """

    class _CacheItemSchema(ServerSchema):
        key: CacheKey
        data: Any  # This type must be Any for Pydantic to work properly

    data: T | None = Field(default=None)
    cache: list[_CacheItemSchema] = Field(
        default_factory=[], exclude_if=lambda c: not len(c)
    )

    @model_validator(mode='wrap')
    @classmethod
    def generate_schema(cls, data: Any, handler: ModelWrapValidatorHandler[Any]) -> Any:
        """Generate the schema.

        This validator mutates the incoming data so that the proper output schema is
        created. It's a little hacky but it's the best solution for returning multiple
        values in a schema.

        If a cacheable item is provided as input, the schema is generated appropriately.
        If a dictionary containing a 'cache' key is provided with an iterable of
        SQLAlchemy models as the entry, the cache schema is generated.

        Args:
            data (Any): _description_
            handler (ModelWrapValidatorHandler[Any]): _description_

        Returns:
            Any: a validated schema.

        """
        if isinstance(data, CacheableProtocol):
            data = {
                'data': get_schema(type(data)).model_validate(data),
                'cache': [
                    CacheSchema._CacheItemSchema(
                        key=model.cache_key(),
                        data=get_schema(type(model)).model_validate(model),
                    )
                    for model in data.get_updates()
                ],
            }
        elif isinstance(data, dict) and 'cache' in data.keys():
            data['cache'] = [
                CacheSchema._CacheItemSchema(
                    key=model.cache_key(),
                    data=get_schema(type(model)).model_validate(model),
                )
                for model in data['cache']
            ]

        return handler(data)


class APIResponse[T: Any](JSONResponse):
    """Used to wrap all API responses in a common JSON interface.

    This class provides a wrapper for returning APISchemas in a nice way. This class is
    a subclass of the FastAPI response class and also does not require the use of
    keyword args to instantiate the response.
    """

    @override
    def render(self, content: Any) -> bytes:
        transaction_uuid: UUID = uuid4()
        status_code = HTTPStatus(self.status_code)
        error: bool = status_code.is_client_error or status_code.is_server_error

        # Generate the final payload
        payload: dict[str, Any] = (
            content
            if isinstance(content, dict) and 'data' in content.keys()
            else {'error' if error else 'data': content}
        )
        if 'data' not in payload:
            payload['data'] = None
        payload['statusCode'] = self.status_code
        payload['timestamp'] = datetime.now()
        payload['transactionUuid'] = transaction_uuid

        # Send a WebSocket cache message
        cache: Any = payload.get('cache', None)
        if cache:
            send_all('cache', cache, transaction_uuid)

        return json.dumps(
            payload,
            ensure_ascii=False,
            allow_nan=False,
            indent=None,
            separators=(',', ':'),
            default=(str),  # Serialize datetime objects
        ).encode('utf-8')


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
