from .bout import Bout, Timeout
from .jam import Jam, JamId, StopReason, TeamJam, Trip
from .team import Roster, Team, TeamString

# TODO: Bout initialization should be handled by referees
_default_bout: Bout = Bout('WFTDA 2025')
_default_bout.clocks.game.set_alarm(minutes=30)
_default_bout.clocks.lineup.set_alarm(seconds=30)
_default_bout.clocks.jam.set_alarm(minutes=2)
_default_bout.teams = Team(Roster('Home')), Team(Roster('Away'))
_default_bout.get_latest_jam().team_jams = _default_bout.teams


bouts = Bout.bouts

__all__ = (
    'bouts',
    'Bout',
    'Jam',
    'JamId',
    'TeamJam',
    'Trip',
    'Roster',
    'StopReason',
    'Team',
    'TeamString',
    'Timeout',
)
