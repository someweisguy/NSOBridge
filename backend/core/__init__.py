"""Core NSO Bridge dependencies.

This file exports the core functions needed to run NSO Bridge.
"""

from .dependencies import AsyncSessionDepends, EngineFactory
from .models import CASCADE_CHILD, CASCADE_OTHER, BaseSQLModel
from .router import FRONTEND, api_router, pages_router
from .schemas import ClientSchema, ServerSchema
from .service import (
    APIResponseClass,
    DatabaseEngine,
    Memento,
    configure_error_handlers,
    run,
    shutdown,
)

__all__ = (
    'api_router',
    'APIResponseClass',
    'AsyncSessionDepends',
    'BaseSQLModel',
    'CASCADE_CHILD',
    'CASCADE_OTHER',
    'ClientSchema',
    'configure_error_handlers',
    'DatabaseEngine',
    'EngineFactory',
    'FRONTEND',
    'Memento',
    'pages_router',
    'run',
    'ServerSchema',
    'shutdown',
)
