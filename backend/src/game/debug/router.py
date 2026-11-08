"""FastAPI routes associated with debugging."""

from game.series.models import Series
from game.rules.schemas import RulesetSchema

from typing import Final, Sequence

from core.db import CacheAPIRoute
from core.users import GetUser
from fastapi import APIRouter
from game.bouts.router import get_bout, get_default_ruleset
from game.jams.router import get_jam
from game.series.router import get_series
from game.timeouts.router import get_timeout

TAG = 'Debugging'


router: Final[APIRouter] = APIRouter(
    prefix='/debug', route_class=CacheAPIRoute, tags=[TAG]
)


@router.get('/data')
async def debug_data(user: GetUser):
    """Get debug data for use in Storybook."""
    default_rulesets: dict[str, RulesetSchema] = await get_default_ruleset()
    all_series: Series | Sequence[Series] = await get_series(user)
    # TODO: Get each Bout in the Series
    # TODO: Get the active & latest jam in the active Bout
    # TODO: Get the latest Timeout in the active Bout, if it exists
    return
