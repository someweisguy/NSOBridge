"""Utilities for use in the core application.

These should not generally be used outside of the core module.

"""

from __future__ import annotations

import logging
import os
import sys
import time
from pathlib import Path
from typing import TYPE_CHECKING, Awaitable, Callable

if TYPE_CHECKING:
    from fastapi import Request, Response


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
    threshold_milliseconds: float = 200
    start_time: float = time.perf_counter()
    response: Response = await call_next(request)
    process_time: float = round((time.perf_counter() - start_time) * 1000, 3)
    if process_time >= threshold_milliseconds:
        logging.warning(
            f'{request.method} {request.url.path} took {process_time}ms to complete'
        )
    return response
