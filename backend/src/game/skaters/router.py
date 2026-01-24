"""FastAPI routes associated with Rosters."""

from typing import Final

from fastapi import APIRouter

SKATERS_TAG = 'Skater'

router: Final[APIRouter] = APIRouter(prefix='/skater', tags=[SKATERS_TAG])
