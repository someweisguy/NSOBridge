from typing import Final

from fastapi import APIRouter

from .bouts.router import router as bout_router
from .jams.router import router as jam_router
from .rosters.router import router as roster_router
from .series.router import router as series_router

ROUTERS: Final[tuple[APIRouter, ...]] = (
    bout_router,
    jam_router,
    roster_router,
    series_router,
)


__all__ = ('ROUTERS',)
