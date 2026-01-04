"""Core NSO Bridge dependencies.

This file exports the core functions needed to run NSO Bridge.
"""

from .dependencies import AsyncSessionDepends, EngineFactory
from .models import CASCADE_CHILD, CASCADE_OTHER, BaseSQLModel
from .router import FRONTEND
from .schemas import ClientSchema, ServerSchema
from .service import (
    APIResponseClass,
    DatabaseEngine,
    Memento,
    configure,
    main,
    shutdown,
)

__all__ = (
    'APIResponseClass',
    'AsyncSessionDepends',
    'BaseSQLModel',
    'CASCADE_CHILD',
    'CASCADE_OTHER',
    'ClientSchema',
    'configure',
    'DatabaseEngine',
    'EngineFactory',
    'FRONTEND',
    'main',
    'Memento',
    'ServerSchema',
    'shutdown',
)
