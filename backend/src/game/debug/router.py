"""FastAPI routes associated with debugging."""

from typing import Final

from core.db import CacheAPIRoute
from fastapi import APIRouter

TAG = 'Debugging'


router: Final[APIRouter] = APIRouter(
    prefix='/debug', route_class=CacheAPIRoute, tags=[TAG]
)


@router.get('/data')
async def debug_data():
    """Get debug data for use in Storybook."""
    # TODO: Get all Rulesets
    # TODO: Get all Series
    # TODO: Get each Bout in the Series
    # TODO: Get the active & latest jam in the active Bout
    # TODO: Get the latest Timeout in the active Bout, if it exists
    return
