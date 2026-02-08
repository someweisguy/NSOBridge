"""Core NSO Bridge dependencies.

This file exports the core functions needed to run NSO Bridge.
"""

from .database import CASCADE_CHILD, CASCADE_OTHER, BaseSQLModel, DatabaseEngine
from .dependencies import EngineFactory, GetAsyncSession
from .protocols import Memento
from .router import api_router, assets, pages_router
from .schemas import APIResponseClass, ClientSchema, ServerSchema
from .service import (
    configure_logging,
    error_handlers,
    get_default_route,
    get_server,
    shutdown,
)
from .utils import get_resource_path, timedelta_serializer

__all__ = (
    'api_router',
    'APIResponseClass',
    'assets',
    'BaseSQLModel',
    'CASCADE_CHILD',
    'CASCADE_OTHER',
    'ClientSchema',
    'configure_logging',
    'DatabaseEngine',
    'EngineFactory',
    'error_handlers',
    'get_default_route',
    'get_resource_path',
    'get_server',
    'GetAsyncSession',
    'Memento',
    'pages_router',
    'ServerSchema',
    'shutdown',
    'timedelta_serializer',
)
