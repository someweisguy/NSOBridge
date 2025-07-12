from datetime import datetime

from core.models import Gettable, ProjectModel
from core.models.bout.bout import Bout
from core.models.bout.jam import TeamJam, Trip


class AddTrip(ProjectModel):
    def __call__(
        self, team_jam: TeamJam, passes: int, timestamp: datetime
    ) -> tuple[Gettable, ...]:
        team_jam.trips.append(Trip.create(passes, timestamp))

        lead_updates: tuple[Gettable, ...] = ()
        bout: Bout = team_jam.jam.bout
        if not team_jam.jam.lead_is_declared():
            # Keep track of which objects update when setting the Lead Jammer
            lead_updates = bout.referee.set_lead(team_jam, True)

        return team_jam.jam.bout, team_jam.jam, *lead_updates
