"""The models, schemas, and routers which describe the game data structure.

This module describes the structure of the game in a generic sense so that future rule
changes by the WFTDA or any other governing body are able to quickly and easily be
accounted for in the code.

Each sub-folder contains code pertaining to that particular model including its schemas,
dependencies, and routers, if applicable.

The `rulesets` sub-folder contains sub-classes of the applicable base classes which
define how class methods are supposed to behave for a particular ruleset. In other
words, the `rulesets` sub-folders contains game logic for different game rulesets
whereas the other sub-folders contain generic game logic that should not change from
ruleset to ruleset.

Generally, the classes in this module should not be exported. The exceptions to this
rule are seen in the code below. This file exports a tuple of FastAPI routers which
should be used by the core app as well as dedicated ruleset objects for initial data
instantiation.
"""

from typing import Final

import rules
from fastapi import APIRouter

from .bouts.models import BaseBout
from .bouts.router import create_bout, router as bout_router
from .jams.router import router as jam_router
from .series.models import Series
from .series.router import router as series_router
from .skaters.router import router as skater_router
from .teams.models import Team
from .timeouts.router import router as timeout_router

routers: Final[tuple[APIRouter, ...]] = (
    bout_router,
    jam_router,
    skater_router,
    series_router,
    timeout_router,
)


__all__ = (
    'BaseBout',
    'create_bout',
    'routers',
    'rules',
    'Series',
    'Team',
    'WFTDA2025',
)
