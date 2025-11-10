from typing import Final

from fastapi import APIRouter

from .bouts.router import router as bout_router
from .jams.router import router as jam_router
from .rosters.router import router as roster_router
from .series.router import router as series_router
from .team_jams.router import router as team_jam_router
from .timeouts.router import router as timeout_router

ROUTERS: Final[tuple[APIRouter, ...]] = (
    bout_router,
    jam_router,
    roster_router,
    series_router,
    timeout_router,
    team_jam_router,
)


__all__ = ('ROUTERS',)
