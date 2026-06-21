"""Handle users and authentication.

This module is used to store a per-user command history and initialize endpoints for
users to undo and redo commands.
"""

from typing import Final

from fastapi import APIRouter

from .dependencies import GetUser
from .router import router
from .service import Memento, User

routers: Final[tuple[APIRouter, ...]] = (router,)

__all__ = (
    'GetUser',
    'routers',
    'User',
    'Memento',
)
