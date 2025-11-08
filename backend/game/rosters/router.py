from typing import Final

from fastapi import APIRouter
from game.rosters.dependencies import get_rosters

from .schemas import RosterSchema

router: Final[APIRouter] = APIRouter(prefix='/roster')
router.add_api_route('', get_rosters, response_model=list[RosterSchema])
