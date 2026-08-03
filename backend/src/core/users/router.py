"""Endpoints for user commands such as undo and redo."""

import logging
from http import HTTPStatus
from typing import Final

from fastapi import APIRouter, HTTPException

from .dependencies import GetUser
from .schemas import HistorySchema

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


@router.get('/history')
async def _history(user: GetUser) -> HistorySchema:
    """Get the undo and redo history of this user."""
    return HistorySchema(
        undo=[message for message, _ in user.undo_history],
        redo=[message for message, _ in user.redo_history],
    )
