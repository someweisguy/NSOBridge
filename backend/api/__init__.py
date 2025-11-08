from typing import Final

from fastapi import APIRouter
from users.users import UserDepends

from .bout import router as bout_router
from .jam import router as jam_router
from .roster import router as roster_router
from .series import router as series_router

router: Final[APIRouter] = APIRouter()


@router.post('/undo')
async def undo(user: UserDepends) -> None:
    await user.undo()


@router.post('/redo')
async def redo(user: UserDepends) -> None:
    await user.redo()


ROUTERS: Final[tuple[APIRouter, ...]] = (
    router,
    bout_router,
    jam_router,
    roster_router,
    series_router,
)


__all__ = ('ROUTERS',)
