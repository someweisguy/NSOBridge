from datetime import datetime

from core.models import Gettable, ProjectModel
from core.models.bout.bout import Bout
from core.models.bout.jam import TeamJam, Trip


class AddTrip(ProjectModel):
    def __call__(self, team_jam: TeamJam, passes: int) -> tuple[Gettable, ...]:
        team_jam.trips.append(Trip(passes, datetime.now()))
        
        lead_updates: tuple[Gettable, ...] = ()
        bout: Bout = team_jam.jam.bout
        if not team_jam.jam.lead_is_declared():
            lead_updates = bout.referee.declare_lead(team_jam, True)
            
        return team_jam.jam.bout, team_jam.jam, *lead_updates
