from datetime import datetime
from typing import Annotated, AsyncGenerator, Final

from fastapi import APIRouter, Depends

from models import GenericBoutModel, get_db


async def get_session_bout(key: int) -> AsyncGenerator[GenericBoutModel, None]:
    async with get_db() as db, db.begin():
        bout: GenericBoutModel | None = await db.get(GenericBoutModel, key)
        if bout is None:
            raise KeyError(f'Bout was not found ({key=})')
        yield bout
        await db.commit()


BoutDepends = Annotated[GenericBoutModel, Depends(get_session_bout)]


router: Final[APIRouter] = APIRouter(prefix='/rules')


@router.post('/setup-track')
async def setup_track(bout: BoutDepends) -> None:
    bout.setup_track(datetime.now())


@router.post('/clear-track')
async def clear_track(bout: BoutDepends) -> None:
    bout.clear_track(datetime.now())


@router.post('/start-jam')
async def start_jam(bout: BoutDepends) -> None:
    bout.start_jam(datetime.now())


@router.post('/stop-jam')
async def stop_jam(bout: BoutDepends) -> None:
    bout.stop_jam(datetime.now())


@router.post('/call-timeout')
async def call_timeout(bout: BoutDepends) -> None:
    bout.start_timeout(datetime.now())


@router.post('/end-timeout')
async def end_timeout(bout: BoutDepends) -> None:
    bout.stop_timeout(datetime.now())


__all__ = ('router',)
