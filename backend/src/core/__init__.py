"""Core NSO Bridge dependencies.

This file exports the core functions needed to run NSO Bridge.
"""

from .dependencies import AsyncSessionDepends, EngineFactory
from .models import CASCADE_CHILD, CASCADE_OTHER, BaseSQLModel
from .router import api_router, assets, pages_router
from .schemas import ClientSchema, ServerSchema
from .service import (
    APIResponseClass,
    DatabaseEngine,
    Memento,
    error_handlers,
    run,
    shutdown,
)
from .utils import timedelta_serializer

__all__ = (
    'api_router',
    'APIResponseClass',
    'assets',
    'AsyncSessionDepends',
    'BaseSQLModel',
    'CASCADE_CHILD',
    'CASCADE_OTHER',
    'ClientSchema',
    'DatabaseEngine',
    'EngineFactory',
    'error_handlers',
    'Memento',
    'pages_router',
    'run',
    'ServerSchema',
    'shutdown',
    'timedelta_serializer',
)
