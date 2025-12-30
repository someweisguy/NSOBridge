"""Endpoints for user commands such as undo and redo."""

from typing import Final

from fastapi import APIRouter

from .dependencies import GetUser

HISTORY_TAG = 'History'

router: Final[APIRouter] = APIRouter()


@router.post('/undo', tags=[HISTORY_TAG])
async def _undo(user: GetUser) -> None:
    await user.undo()


@router.post('/redo', tags=[HISTORY_TAG])
async def _redo(user: GetUser) -> None:
    await user.redo()
