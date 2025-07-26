from typing import Annotated, Any, AsyncGenerator, Final

from fastapi import APIRouter, Depends

from models import BoutModel, get_bout, get_db
from rules import REFEREES, AbstractReferee


async def get_referee(bout_id: int) -> AsyncGenerator[AbstractReferee, None]:
    async with get_db() as db, db.begin():
        bout: BoutModel = await get_bout(bout_id)
        referee: type[AbstractReferee] | None = REFEREES.get(bout.ruleset)
        if referee is None:
            raise KeyError(f'Referee not found ({bout.ruleset=})')

        yield referee(db=db)

        # TODO: Pass session dirty/deleted/new identity maps to updater module

        await db.commit()


RefereeDepends = Annotated[AbstractReferee, Depends(get_referee)]
BoutDepends = Annotated[BoutModel, Depends(get_bout)]


router: Final[APIRouter] = APIRouter(prefix='/rules')


# TODO: async def get_series()


@router.post('/start-jam')
async def start_jam(referee: RefereeDepends, bout: BoutDepends) -> dict[str, Any]:
    await referee.start_jam(bout)
    return {}


@router.post('/stop-jam')
async def stop_jam(referee: RefereeDepends, bout: BoutDepends) -> dict[str, Any]:
    await referee.stop_jam(bout)
    return {}


__all__ = ('router',)
