from typing import Final

from core import UserDepends
from fastapi import APIRouter

router: Final[APIRouter] = APIRouter()


@router.post('/undo')
async def undo(history: UserDepends) -> None:
    await history.undo()


@router.post('/redo')
async def redo(history: UserDepends) -> None:
    await history.redo()
