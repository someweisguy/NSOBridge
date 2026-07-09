"""Endpoints for user commands such as undo and redo."""

import logging
from http import HTTPStatus
from http.client import HTTPException
from typing import Final

from fastapi import APIRouter

from .dependencies import GetUser

HISTORY_TAG = 'History'

router: Final[APIRouter] = APIRouter(tags=[HISTORY_TAG])


@router.post('/undo')
async def _undo(user: GetUser) -> None:
    """Undo the last command that this user executed."""
    logging.info('User is undoing their last transaction')
    if len(user.undo_history) == 0:
        raise HTTPException(HTTPStatus.CONFLICT, 'There is nothing left to undo')
    await user.undo()


@router.post('/redo')
async def _redo(user: GetUser) -> None:
    """Redo the last command that this user executed."""
    logging.info('User is redoing their last transaction')
    if len(user.redo_history) == 0:
        raise HTTPException(HTTPStatus.CONFLICT, 'There is nothing left to redo')
    await user.redo()
