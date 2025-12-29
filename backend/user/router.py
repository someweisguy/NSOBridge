from typing import Final

from fastapi import APIRouter

from .dependencies import GetUser

router: Final[APIRouter] = APIRouter()


@router.post('/undo')
async def undo(user: GetUser) -> None:
    await user.undo()


@router.post('/redo')
async def redo(user: GetUser) -> None:
    await user.redo()
