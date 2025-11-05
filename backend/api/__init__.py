from typing import Final

from fastapi.routing import APIRouter

from .api import router as api_router
from .bout import router as bout_router
from .jam import router as jam_router
from .roster import router as roster_router
from .series import router as series_router

ROUTERS: Final[tuple[APIRouter, ...]] = (
    api_router,
    bout_router,
    jam_router,
    roster_router,
    series_router,
)


__all__ = ('ROUTERS',)
