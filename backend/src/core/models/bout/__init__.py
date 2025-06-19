from typing import Annotated

from fastapi import Depends

from core.models.bout.rules import get_ruleset

from .bout import Bout, Referee, Timeout
from .jam import Jam, JamId, StopReason, TeamJam, Trip
from .team import Roster, Team

# TODO: Instantiating the initial Bout should eventually be handled by the user
Bout(
    rosters=(Roster('Home'), Roster('Away')), referee=get_ruleset('WFTDA 2025')
)


bouts = Bout.bouts


def _referee_depends(bout_id: str) -> Referee:
    bout: Bout = bouts[bout_id]
    return bout.referee


def _bout_depends(bout_id: str) -> Bout:
    return bouts[bout_id]


def _jam_depends(bout_id: str, period_num: int, jam_num: int) -> Jam:
    bout: Bout = bouts[bout_id]
    return bout.get_jam(period_num, jam_num)


RefereeDepend = Annotated[Referee, Depends(_referee_depends)]
BoutDepend = Annotated[Bout, Depends(_bout_depends)]
JamDepend = Annotated[Jam, Depends(_jam_depends)]

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
