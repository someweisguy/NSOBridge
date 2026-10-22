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
    return
