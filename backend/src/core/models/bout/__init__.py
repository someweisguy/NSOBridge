from __future__ import annotations

from typing import Annotated

from fastapi import Depends

from core.models.bout.rules import get_ruleset

from .bout import Bout, Referee, Timeout
from .jam import Jam, JamId, StopReason, TeamJam, Trip
from .team import Roster, Team

# TODO: Instantiating the initial Bout should eventually be handled by the user
Bout.create(
    rosters=(Roster.create('Home'), Roster.create('Away')),
    referee=get_ruleset('WFTDA 2025'),
)


bouts = Bout.bouts


def _bout_depends(bout_id: str) -> Bout:
    return bouts[bout_id]


def _referee_depends(bout: BoutDepend) -> Referee:
    return bout.referee


def _jam_depends(bout: BoutDepend, period_num: int, jam_num: int) -> Jam:
    return bout.get_jam(period_num, jam_num)


def _team_jam_depends(jam: JamDepend, team: int) -> TeamJam:
    return jam.team_jams[team]


BoutDepend = Annotated[Bout, Depends(_bout_depends)]
RefereeDepend = Annotated[Referee, Depends(_referee_depends)]
JamDepend = Annotated[Jam, Depends(_jam_depends)]
TeamJamDepend = Annotated[TeamJam, Depends(_team_jam_depends)]

__all__ = (
    'bouts',
    'Bout',
    'BoutDepend',
    'Jam',
    'JamDepend',
    'JamId',
    'TeamJam',
    'Trip',
    'Referee',
    'RefereeDepend',
    'Roster',
    'StopReason',
    'Team',
    'TeamString',
    'Timeout',
)
