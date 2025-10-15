from typing import Final

from commands import HistoryDepends
from fastapi import APIRouter

router: Final[APIRouter] = APIRouter()


@router.post('/undo')
async def undo(history: HistoryDepends) -> None:
    await history.undo()

@router.post('/redo')
async def redo(history: HistoryDepends) -> None:
    await history.redo()
