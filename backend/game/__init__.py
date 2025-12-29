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

import ws
from core import BaseSQLModel
from fastapi import APIRouter
from sqlalchemy import event
from sqlalchemy.orm import Session

from .bouts.router import router as bout_router
from .jams.router import router as jam_router
from .models import CacheKey
from .rosters.models import Roster
from .rosters.router import router as roster_router
from .rulesets import wftda_2025
from .series.models import Series
from .series.router import router as series_router
from .timeouts.router import router as timeout_router


@event.listens_for(Session, 'before_commit')
def _handle_dirty_session(session: Session) -> None:
    # Add each dirty or deleted model to a set for updates
    models: set[BaseSQLModel] = {
        model
        for identity_map in [session.dirty, session.deleted]
        for model in identity_map
        if isinstance(model, BaseSQLModel)
    }

    if len(models) > 0:
        ws.broadcast_updates(models)


game_routers: Final[tuple[APIRouter, ...]] = (
    bout_router,
    jam_router,
    roster_router,
    series_router,
    timeout_router,
)


__all__ = (
    'CacheKey',
    'game_routers',
    'Roster',  # Non-rule-bound objects can be exported
    'Series',  # Non-rule-bound objects can be exported
    'wftda_2025',
)
