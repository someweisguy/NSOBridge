"""FastAPI routes associated with Rules."""

from datetime import datetime
from typing import TYPE_CHECKING, Annotated, Final

from core.db import CacheAPIRoute
from fastapi import APIRouter, Body, Query
from game.bouts.dependencies import GetBout, GetTeam
from game.bouts.models import BaseBout
from game.bouts.schemas import BoutSchema, RulesetSchema

if TYPE_CHECKING:
    from game.timeouts.models import Timeout

TAG = 'Rules'

ALL_RULESETS: Final[set[RulesetSchema]] = set()
"""A list of all the unique rulesets in this application."""


def _compute_all_rulesets() -> None:
    """Collect all the rulesets in the application."""
    if len(ALL_RULESETS) == 0:
        for subclass in BaseBout.__subclasses__():
            ALL_RULESETS.add(subclass.ruleset)


router: Final[APIRouter] = APIRouter(
    prefix='/bout', route_class=CacheAPIRoute, tags=[TAG]
)


@router.get('/ruleset', response_model=RulesetSchema | set[RulesetSchema])
async def get_ruleset(
    ruleset_name: Annotated[str | None, Query(alias='rulesetName')] = None,
) -> RulesetSchema | set[RulesetSchema]:
    """Get the ruleset associated with a specific Bout."""
    _compute_all_rulesets()
    if ruleset_name is None:
        return ALL_RULESETS
    return next(ruleset for ruleset in ALL_RULESETS if ruleset.name == ruleset_name)


@router.post('/beginPeriod', response_model=BoutSchema)
async def begin_period(bout: GetBout) -> BaseBout:
    """Begin the period of the specified Bout."""
    bout.begin_period(datetime.now())
    return bout


@router.post('/endPeriod', response_model=BoutSchema)
async def end_period(bout: GetBout) -> BaseBout:
    """End the period of the specified Bout."""
    bout.end_period(datetime.now())
    return bout


@router.post('/startJam', response_model=BoutSchema)
async def start_jam(bout: GetBout) -> BaseBout:
    """Start the next Jam of the specified Bout."""
    bout.start_jam(datetime.now())
    return bout


@router.post('/stopJam', response_model=BoutSchema)
async def stop_jam(bout: GetBout) -> BaseBout:
    """Stop the active Jam of the specified Bout."""
    bout.stop_jam(datetime.now())
    return bout


@router.post('/startTimeout', response_model=BoutSchema)
async def start_timeout(
    bout: GetBout,
    # TODO: replace with team_uuid
    team_num: Annotated[int | None, Body(alias='teamNum')] = None,
    is_review: Annotated[bool, Body(alias='isReview')] = False,
) -> BaseBout:
    """Start a new Timeout in the specified Bout."""
    bout.start_timeout(datetime.now())
    timeout: Timeout | None = bout.get_last_timeout()
    if timeout is not None:
        timeout.is_review = is_review
        if team_num is not None:
            timeout._team = bout.teams[team_num]
    return bout


@router.post(path='/stopTimeout', response_model=BoutSchema)
async def stop_timeout(bout: GetBout) -> BaseBout:
    """Stop the active Timeout in the specified Bout."""
    bout.stop_timeout(datetime.now())
    return bout


@router.post('/team/trip', response_model=BoutSchema)
async def add_trip(
    team: GetTeam,
    passes: Annotated[int, Body()],
) -> BaseBout:
    """Add a Trip for the specified Team of the specified Jam."""
    bout: BaseBout = team.bout
    bout.add_trip(team, datetime.now(), passes)
    return bout


@router.post('/team/lead', response_model=BoutSchema)
async def set_lead(
    team: GetTeam,
    lead: Annotated[bool, Body()],
) -> BaseBout:
    """Set Lead for the specified Team of the specified Jam."""
    bout: BaseBout = team.bout
    bout.add_lead(team, datetime.now(), lead)
    return bout


@router.post('/team/lost', response_model=BoutSchema)
async def set_lost(
    team: GetTeam,
    lost: Annotated[bool, Body()],
) -> BaseBout:
    """Set Lost for the specified Team of the specified Jam."""
    bout: BaseBout = team.bout
    bout.add_lost(team, datetime.now(), lost)
    return bout


@router.post('/team/starPass', response_model=BoutSchema)
async def set_star_pass(
    team: GetTeam,
    star_pass: Annotated[bool, Body(alias='starPass')],
) -> BaseBout:
    """Set a Star Pass for the specified Team of the specified Jam."""
    bout: BaseBout = team.bout
    bout.add_star_pass(team, datetime.now(), star_pass)
    return bout


@router.post(path='/finalize', response_model=BoutSchema)
async def finalize(bout: GetBout) -> BaseBout:
    """Finalize the Bout."""
    bout.finalize()
    return bout


__all__ = ('router',)
