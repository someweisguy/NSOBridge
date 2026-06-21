"""Core NSO Bridge dependencies.

This file exports the core functions needed to run NSO Bridge.
"""

from .app import error_handlers
from .app.constants import timedelta_serializer
from .app.response import APIResponse
from .app.router import api_router, assets, pages_router
from .app.schemas.base import ClientSchema, ServerSchema
from .app.schemas.cache import CacheItemSchema
from .app.utils import (
    endpoint_profiling_middleware,
    get_resource_path,
)
from .app.ws import disconnect_all, send_all, ws
from .logging import configure_logging
from .server import (
    get_default_route,
    get_server,
    shutdown,
)
from .users.service import Memento

__all__ = (
    'api_router',
    'APIResponse',
    'assets',
    'CacheItemSchema',
    'ClientSchema',
    'configure_logging',
    'disconnect_all',
    'endpoint_profiling_middleware',
    'error_handlers',
    'get_default_route',
    'get_resource_path',
    'get_server',
    'Memento',
    'pages_router',
    'send_all',
    'ServerSchema',
    'shutdown',
    'timedelta_serializer',
    'ws',
)
