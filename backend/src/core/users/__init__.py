"""Handle users and authentication.

Every user has their own command history. When a use makes changes to the application
state, the previous history should be stored in the user's command history. This
application uses the Memento pattern to achieve this behavior. This submodule lays the
groundwork for a reusable Memento pattern, which other modules may apply.
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
