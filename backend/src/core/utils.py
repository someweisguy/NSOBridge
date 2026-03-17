"""Utilities for use in the core application.

These should not generally be used outside of the core module.

"""

from __future__ import annotations

import logging
import os
import sys
import time
from datetime import timedelta
from math import floor
from pathlib import Path
from typing import TYPE_CHECKING, Any, Awaitable, Callable, override

from pydantic import PlainSerializer
from sqlalchemy.types import Integer, TypeDecorator, TypeEngine

if TYPE_CHECKING:
    from fastapi import Request, Response
    from sqlalchemy import Dialect


timedelta_serializer = PlainSerializer(lambda td: floor(td.total_seconds() * 1000))

tags_metadata: list[dict[str, str]] = [
    {
        'name': 'Series',
        'description': 'A sequence of Bouts, such as a double-header or a tournament.',
    },
    {
        'name': 'Rosters',
        'description': 'Roster management',
    },
    {
        'name': 'Bouts',
        'description': 'Bout and bout state controls',
    },
    {
        'name': 'Jams',
        'description': 'Manage ',
    },
    {
        'name': 'Timeouts',
        'description': 'Manage items. So _fancy_ they have their own docs.',
    },
    {
        'name': 'History',
        'description': 'User history commands',
    },
    {
        'name': 'Pages',
        'description': 'Endpoints that render HTML.',
    },
]


class _TimedeltaAsMilliseconds(TypeDecorator[Integer]):
    """Converts integer number of milliseconds to a Python timedelta object.

    This class is used for converting values to and from the model database.
    """

    impl: TypeEngine[Any] | type[TypeEngine[Any]] = Integer
    cache_ok: bool | None = True

    @override
    def process_bind_param(self, value: Any | None, dialect: Dialect) -> Any:
        if value is not None:
            if not isinstance(value, timedelta):
                raise TypeError()
            return floor(value.total_seconds() * 1000)
        return value

    @override
    def process_result_value(self, value: Any | None, dialect: Dialect) -> Any | None:
        if not isinstance(value, (float, int)):
            raise TypeError()
        return timedelta(milliseconds=value)


def get_resource_path(relative_path: str) -> Path:
    """Get absolute path to resource, works for dev and for pyinstaller.

    Args:
        relative_path (LiteralStr): the relative path of the desired resource.

    Returns:
        Path: a path to the resource.

    """
    base_path: str | Path = getattr(sys, '_MEIPASS', Path.cwd())
    return Path(os.path.join(base_path, relative_path))


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
    threshold_milliseconds: float = 100
    start_time: float = time.perf_counter()
    response: Response = await call_next(request)
    process_time: float = round((time.perf_counter() - start_time) * 1000, 3)
    if process_time >= threshold_milliseconds:
        logging.debug(
            f'{request.method} {request.url.path} took {process_time}ms to complete'
        )
    return response
