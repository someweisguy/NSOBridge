from typing import Final

from fastapi import APIRouter

from .dependencies import UserDepends

router: Final[APIRouter] = APIRouter()


@router.post('/undo')
async def undo(user: UserDepends) -> None:
    await user.undo()


@router.post('/redo')
async def redo(user: UserDepends) -> None:
    await user.redo()
