"""Core NSO Bridge dependencies.

This file exports the core functions needed to run NSO Bridge.
"""

from .memento import Memento
from .router import api_router, assets, pages_router
from .schemas.api import APIResponseClass
from .schemas.base import ClientSchema, ServerSchema
from .service import (
    configure_logging,
    error_handlers,
    get_default_route,
    get_server,
    shutdown,
)
from .types import CacheKey
from .utils import (
    endpoint_profiling_middleware,
    get_resource_path,
    timedelta_serializer,
)
from .ws import disconnect_all, invalidate_queries, ws

__all__ = (
    'api_router',
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
