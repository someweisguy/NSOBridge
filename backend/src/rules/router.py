"""FastAPI routes associated with Bouts."""

import logging
from datetime import timedelta
from typing import Final

from fastapi import APIRouter
from game.bouts.dependencies import GetBout
from game.bouts.models import BaseBout

from .schemas import Ruleset

router: Final[APIRouter] = APIRouter(prefix='/bout')

RULESET_NAMES: set[str] = set()

# Compute the ruleset names supported by the application
for subclass in BaseBout.__subclasses__():
    if not hasattr(subclass, 'RULESET_NAME') or not isinstance(
        subclass.RULESET_NAME, str
    ):
        logging.error(f'{subclass.__class__.__name__} does not have a ruleset name.')
        continue
    if subclass.RULESET_NAME in RULESET_NAMES:
        logging.error(f'Duplicate ruleset name detected ({subclass.RULESET_NAME})')
    RULESET_NAMES.add(subclass.RULESET_NAME)


@router.get('/ruleset')
async def get_ruleset(bout: GetBout) -> Ruleset:
    # TODO: this api should be deprecated
    return Ruleset(
        name='WFTDA 2025',
        num_periods=2,
        jam_duration=timedelta(minutes=2),
        lineup_duration=timedelta(seconds=30),
        points_per_trip=4,
        num_timeouts=3,
        num_reviews=1,
    )


@router.get('/allRulesetNames')
async def get_all_ruleset_names() -> list[str]:
    return list(RULESET_NAMES)


__all__ = ('router',)
