from typing import Annotated, Final

from fastapi import APIRouter, Depends

from core.models.game import get_bout, get_db
from core.models.game.bout import SQLBout
from core.models.rules import REFEREES
from core.models.rules.wftda_2025 import Referee


async def get_referee(bout_id: int) -> type[Referee]:
    bout: SQLBout | None = await get_bout(bout_id)
    if bout is None:
        raise KeyError(f'Bout not found ({bout_id=})')
    referee: type[Referee] | None = REFEREES.get(bout.ruleset)
    if referee is None:
        raise KeyError(f'Referee not found ({bout.ruleset=})')
    return referee


RulesetDepends = Annotated[type[Referee], Depends(get_referee)]
BoutDepends = Annotated[SQLBout, Depends(get_bout)]


async def get_api_db(ruleset: RulesetDepends):
    async with get_db() as db:
        yield ruleset(db=db)
        await db.commit()


RefereeDepends = Annotated[Referee, Depends(get_api_db)]

router: Final[APIRouter] = APIRouter(prefix='/rules')


# TODO: async def get_series()


@router.post('/start-jam')
async def start_jam(referee: RefereeDepends, bout: BoutDepends) -> dict:
    return await referee.start_jam(bout)


@router.post('/stop-jam')
async def stop_jam(referee: RefereeDepends, bout: BoutDepends) -> dict:
    return await referee.stop_jam(bout)


__all__ = ('router',)
