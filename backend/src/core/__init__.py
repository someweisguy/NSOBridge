"""Core NSO Bridge dependencies.

This file exports the core functions needed to run NSO Bridge.
"""

from .app.response import APIResponse
from .app.router import api_router, assets, pages_router
from .app.schemas.base import ClientSchema, ServerSchema
from .app.schemas.cache import CacheItemSchema
from .app.utils import (
    endpoint_profiling_middleware,
    get_resource_path,
    timedelta_serializer,
)
from .app.ws import disconnect_all, invalidate_queries, ws
from .error_handlers import error_handlers
from .logging import configure_logging
from .memento import Memento
from .server import (
    get_default_route,
    get_server,
    shutdown,
)
from .types import CacheKey

__all__ = (
    'api_router',
    'APIResponse',
    'assets',
    'CacheItemSchema',
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
