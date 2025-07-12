from typing import Final

from fastapi import APIRouter

from core.models.bout import bouts

router: Final[APIRouter] = APIRouter(prefix='/series')


@router.get('')
async def get() -> list:
    view: list = []
    for bout in bouts.values():
        view.append({'id': bout.id, 'description': None})
    return view


@router.post('/bout')
async def add_bout() -> None:
    pass  # TODO


__all__ = ('router',)
