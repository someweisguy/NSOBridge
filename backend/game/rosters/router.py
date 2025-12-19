from typing import Final

from fastapi import APIRouter

from .dependencies import get_roster
from .schemas import RosterSchema

router: Final[APIRouter] = APIRouter(prefix='/roster')
router.add_api_route('', get_roster, response_model=RosterSchema)
