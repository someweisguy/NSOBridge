"""Endpoints for user commands such as undo and redo."""

import logging
from http import HTTPStatus
from typing import Final

from fastapi import APIRouter, HTTPException, Request

from core.db import CacheAPIRoute, GetAsyncSession

from .dependencies import GetUser
from .schemas import HistorySchema

HISTORY_TAG = 'History'


router: Final[APIRouter] = APIRouter(route_class=CacheAPIRoute, tags=[HISTORY_TAG])


@router.post('/undo')
async def _undo(request: Request, user: GetUser, _: GetAsyncSession) -> None:
    """Undo the last command that this user executed."""
    if len(user.undo_history) == 0:
        raise HTTPException(HTTPStatus.CONFLICT, 'There is nothing left to undo')

    message: str = await user.undo(request)
    logging.info(f'User is undoing `{message}`')


@router.post('/redo')
async def _redo(request: Request, user: GetUser, _: GetAsyncSession) -> None:
    """Redo the last command that this user executed."""
    if len(user.redo_history) == 0:
        raise HTTPException(HTTPStatus.CONFLICT, 'There is nothing left to redo')

    message: str = await user.redo(request)
    logging.info(f'User is redoing `{message}`')


@router.get('/history')
async def _history(user: GetUser) -> HistorySchema:
    """Get the undo and redo history of this user."""
    return HistorySchema(
        undo=[message for message, _ in user.undo_history],
        redo=[message for message, _ in user.redo_history],
    )
