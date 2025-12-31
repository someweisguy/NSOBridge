"""Endpoints for user commands such as undo and redo."""

import logging
from typing import Final

from fastapi import APIRouter

from .dependencies import GetUser

HISTORY_TAG = 'History'

router: Final[APIRouter] = APIRouter()


@router.post('/undo', tags=[HISTORY_TAG])
async def _undo(user: GetUser) -> None:
    """Undo the last command that this user executed."""
    logging.info('User called undo')
    await user.undo()


@router.post('/redo', tags=[HISTORY_TAG])
async def _redo(user: GetUser) -> None:
    """Redo the last command that this user executed."""
    logging.info('User called redo')
    await user.redo()
