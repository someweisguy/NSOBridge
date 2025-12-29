"""Endpoints for user commands such as undo and redo."""

from typing import Final

from fastapi import APIRouter

from .dependencies import GetUser

router: Final[APIRouter] = APIRouter()


@router.post('/undo')
async def _undo(user: GetUser) -> None:
    await user.undo()


@router.post('/redo')
async def _redo(user: GetUser) -> None:
    await user.redo()
