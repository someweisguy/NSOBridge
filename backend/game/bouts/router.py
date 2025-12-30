from datetime import datetime
from typing import TYPE_CHECKING, Annotated, Final

from fastapi import APIRouter, Body
from game.rulesets.schemas import Ruleset
from game.teams.dependencies import OptionalTeamDepends

from .dependencies import BoutDepends, _get_bout
from .schemas import BoutSchema

if TYPE_CHECKING:
    from game.timeouts.models import BaseTimeout

BOUTS_TAG = 'Bouts'

router: Final[APIRouter] = APIRouter(prefix='/bout')
router.add_api_route('', _get_bout, response_model=BoutSchema, tags=[BOUTS_TAG])


@router.get('/ruleset', response_model=Ruleset, tags=[BOUTS_TAG])
async def _get_ruleset(bout: BoutDepends) -> Ruleset:
    return bout.rules


@router.post('/begin-period', tags=[BOUTS_TAG])
async def begin_period(bout: BoutDepends) -> None:
    """Begin the period of the specified Bout."""
    bout.begin_period(datetime.now())


@router.post('/end-period', tags=[BOUTS_TAG])
async def end_period(bout: BoutDepends) -> None:
    """End the period of the specified Bout."""
    bout.end_period(datetime.now())


@router.post('/start-jam', tags=[BOUTS_TAG])
async def start_jam(bout: BoutDepends) -> None:
    """Start the next Jam of the specified Bout."""
    bout.start_jam(datetime.now())


@router.post('/stop-jam', tags=[BOUTS_TAG])
async def stop_jam(bout: BoutDepends) -> None:
    """Stop the active Jam of the specified Bout."""
    bout.stop_jam(datetime.now())


@router.post('/start-timeout', tags=[BOUTS_TAG])
async def start_timeout(
    bout: BoutDepends,
    team: OptionalTeamDepends = None,  # TODO: dependency should be in Body
    is_review: Annotated[bool, Body(alias='isReview')] = False,
) -> None:
    """Start a new Timeout in the specified Bout."""
    timeout: BaseTimeout = bout.start_timeout(datetime.now())
    timeout.is_review = is_review
    if team is not None:
        timeout.team = team


@router.post(path='/stop-timeout', tags=[BOUTS_TAG])
async def stop_timeout(bout: BoutDepends) -> None:
    """Stop the active Timeout in the specified Bout."""
    bout.stop_timeout(datetime.now())


__all__ = ('router',)
