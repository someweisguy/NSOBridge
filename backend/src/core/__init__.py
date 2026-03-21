"""Core NSO Bridge dependencies.

This file exports the core functions needed to run NSO Bridge.
"""

from .error_handlers import error_handlers
from .logging import configure_logging
from .memento import Memento
from .router import api_router, assets, pages_router
from .schemas.api import APIResponseClass, APISchema
from .schemas.base import ClientSchema, ServerSchema
from .types import CacheKey
from .utils import (
    endpoint_profiling_middleware,
    get_resource_path,
    timedelta_serializer,
)
from .uvicorn import (
    get_default_route,
    get_server,
    shutdown,
)
from .ws import disconnect_all, invalidate_queries, ws

__all__ = (
    'api_router',
    'APISchema',
    'APIResponseClass',
    'assets',
    'CacheKey',
    'ClientSchema',
    'configure_logging',
    'disconnect_all',
    'endpoint_profiling_middleware',
    'error_handlers',
    'get_default_route',
    'get_resource_path',
    'get_server',
    'invalidate_queries',
    'Memento',
    'pages_router',
    'ServerSchema',
    'shutdown',
    'timedelta_serializer',
    'ws',
)
