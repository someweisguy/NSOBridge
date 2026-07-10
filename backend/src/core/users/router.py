"""Endpoints for user commands such as undo and redo."""

import logging
from http import HTTPStatus
from typing import Final

from fastapi import APIRouter, HTTPException

from core.app import CacheSchema

from .dependencies import GetUser

HISTORY_TAG = 'History'


router: Final[APIRouter] = APIRouter(tags=[HISTORY_TAG])


@router.post('/undo', response_model=CacheSchema)
async def _undo(user: GetUser) -> dict:
    """Undo the last command that this user executed."""
    logging.info('User is undoing their last transaction')
    if len(user.undo_history) == 0:
        raise HTTPException(HTTPStatus.CONFLICT, 'There is nothing left to undo')
    cache = await user.undo()
    return {'data': None, 'cache': cache}


@router.post('/redo', response_model=CacheSchema)
async def _redo(user: GetUser) -> dict:
    """Redo the last command that this user executed."""
    logging.info('User is redoing their last transaction')
    if len(user.redo_history) == 0:
        raise HTTPException(HTTPStatus.CONFLICT, 'There is nothing left to redo')
    cache = await user.redo()
    return {'data': None, 'cache': cache}
