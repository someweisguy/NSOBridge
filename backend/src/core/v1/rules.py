from typing import Annotated, Callable, Final

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.models.game import get_bout, get_db
from core.models.game.bout import SQLBout
from core.models.rules.referees import REFEREES
from core.models.rules.wftda_2025 import Referee


async def get_referee(bout_id: int) -> Referee:
    bout: SQLBout | None = await get_bout(bout_id)
    if bout is None:
        raise KeyError(f'Bout not found ({bout_id=})')
    referee: Referee | None = REFEREES.get(bout.ruleset)
    if referee is None:
        raise KeyError(f'Referee not found ({bout.ruleset=})')
    return referee


RefereeDepends = Annotated[Referee, Depends(get_referee)]
DatabaseDepends = Annotated[Session, Depends(get_db)]
BoutDepends = Annotated[SQLBout, Depends(get_bout)]


router: Final[APIRouter] = APIRouter(prefix='/rules')


# TODO: async def get_series()


@router.post('/start-jam')
async def start_jam(referee: RefereeDepends, bout: BoutDepends) -> dict:
    async with get_db() as db:
        rule: Callable = referee.start_jam(db=db.begin_nested())
        response: dict = await rule(bout)

        # TODO: Post the updated objects to the Updater

        await db.commit()

    return response


@router.post('/stop-jam')
async def stop_jam(referee: RefereeDepends, bout: BoutDepends) -> dict:
    async with get_db() as db:
        rule: Callable = referee.stop_jam(db=db.begin_nested())
        response: dict = await rule(bout)

        await db.commit()

    return response


__all__ = ('router',)
