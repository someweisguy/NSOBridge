"""FastAPI routes associated with debugging."""

from core.users import GetUser

from typing import Final

from core.db import CacheAPIRoute
from fastapi import APIRouter
from game.bouts.router import get_default_ruleset
from game.series.router import get_series
from game.bouts.router import get_bout
from game.jams.router import get_jam
from game.timeouts.router import get_timeout

TAG = 'Debugging'


router: Final[APIRouter] = APIRouter(
    prefix='/debug', route_class=CacheAPIRoute, tags=[TAG]
)


@router.get('/data')
async def debug_data(user: GetUser):
    """Get debug data for use in Storybook."""
    default_rulesets = get_default_ruleset()
    all_series = get_series(user)

    # TODO: Get each Bout in the Series
    # TODO: Get the active & latest jam in the active Bout
    # TODO: Get the latest Timeout in the active Bout, if it exists
    return
