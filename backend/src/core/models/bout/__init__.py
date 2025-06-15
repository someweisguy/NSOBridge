from .bout import Bout, Timeout
from .jam import Jam, JamId, TeamJam, Trip
from .team import Roster, Team, TeamString

# Add a default Bout
_default_bout: Bout = Bout('WFTDA 2025')
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
    'Team',
    'TeamString',
    'Timeout',
)
