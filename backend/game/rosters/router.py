"""FastAPI routes associated with Rosters."""

from typing import Final

from fastapi import APIRouter

from .dependencies import get_roster
from .schemas import RosterSchema

ROSTERS_TAG = 'Rosters'

router: Final[APIRouter] = APIRouter(prefix='/roster')
router.add_api_route('', get_roster, response_model=RosterSchema, tags=[ROSTERS_TAG])
