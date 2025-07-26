from typing import Annotated, AsyncGenerator, Final

from fastapi import APIRouter, Depends

from models import get_bout, get_db
from models.bout import SQLBout
from rules import REFEREES, Referee


async def get_referee(bout_id: int) -> AsyncGenerator[Referee, None]:
    async with get_db() as db, db.begin():
        bout: SQLBout | None = await get_bout(bout_id)
        if bout is None:
            raise KeyError(f'Bout not found ({bout_id=})')
        referee: type[Referee] | None = REFEREES.get(bout.ruleset)
        if referee is None:
            raise KeyError(f'Referee not found ({bout.ruleset=})')

        yield referee(db=db)

        # TODO: Pass session dirty/deleted/new identity maps to updater module

        await db.commit()


RefereeDepends = Annotated[Referee, Depends(get_referee)]
BoutDepends = Annotated[SQLBout, Depends(get_bout)]


router: Final[APIRouter] = APIRouter(prefix='/rules')


# TODO: async def get_series()


@router.post('/start-jam')
async def start_jam(referee: RefereeDepends, bout: BoutDepends) -> dict:
    return await referee.start_jam(bout)


@router.post('/stop-jam')
async def stop_jam(referee: RefereeDepends, bout: BoutDepends) -> dict:
    return await referee.stop_jam(bout)


__all__ = ('router',)
