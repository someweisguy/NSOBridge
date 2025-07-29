from datetime import datetime
from typing import Annotated, AsyncGenerator, Final

from fastapi import APIRouter, Depends

from models import GenericBoutModel, get_db


async def get_session_bout(bout_id: int) -> AsyncGenerator[GenericBoutModel, None]:
    async with get_db() as db, db.begin():
        bout: GenericBoutModel | None = await db.get(GenericBoutModel, bout_id)
        if bout is None:
            raise KeyError(f'Bout was not found ({bout_id=})')
        yield bout
        await db.commit()


BoutDepends = Annotated[GenericBoutModel, Depends(get_session_bout)]


router: Final[APIRouter] = APIRouter(prefix='/rules')


@router.post('/start-jam')
async def start_jam(bout: BoutDepends) -> None:
    bout.start_jam(datetime.now())


@router.post('/stop-jam')
async def stop_jam(bout: BoutDepends) -> None:
    bout.stop_jam(datetime.now())


__all__ = ('router',)
