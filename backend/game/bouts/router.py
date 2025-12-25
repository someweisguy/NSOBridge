from datetime import datetime
from typing import TYPE_CHECKING, Annotated, Final

from fastapi import APIRouter, Body
from game.rulesets.schemas import Ruleset
from game.teams.dependencies import OptionalTeamDepends

from .dependencies import BoutDepends, get_bout
from .schemas import BoutSchema

if TYPE_CHECKING:
    from game.timeouts.models import BaseTimeout

router: Final[APIRouter] = APIRouter(prefix='/bout')
router.add_api_route('', get_bout, response_model=BoutSchema)


@router.get('/ruleset', response_model=Ruleset)
async def get_ruleset_context(bout: BoutDepends) -> Ruleset:
    return bout.rules


@router.post('/begin-period')
async def begin_period(bout: BoutDepends) -> None:
    bout.begin_period(datetime.now())


@router.post('/end-period')
async def end_period(bout: BoutDepends) -> None:
    bout.end_period(datetime.now())


@router.post('/start-jam')
async def start_jam(bout: BoutDepends) -> None:
    bout.start_jam(datetime.now())


@router.post('/stop-jam')
async def stop_jam(bout: BoutDepends) -> None:
    bout.stop_jam(datetime.now())


@router.post('/start-timeout')
async def start_timeout(
    bout: BoutDepends,
    team: OptionalTeamDepends = None,  # TODO: dependency should be in Body
    is_review: Annotated[bool, Body(alias='isReview')] = False,
) -> None:
    timeout: BaseTimeout = bout.start_timeout(datetime.now())
    timeout.is_review = is_review
    if team is not None:
        timeout.team = team


@router.post(path='/stop-timeout')
async def stop_timeout(bout: BoutDepends) -> None:
    bout.stop_timeout(datetime.now())


__all__ = ('router',)
