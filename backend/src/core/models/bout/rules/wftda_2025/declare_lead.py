from core.models import Gettable, ProjectModel
from core.models.bout.jam import TeamJam


class DeclareLead(ProjectModel):
    def __call__(self, team_jam: TeamJam, lead: bool) -> tuple[Gettable, ...]:
        if lead and team_jam.jam.lead_is_declared():
            raise RuntimeError('A Lead Jammer has already been declared')
        
        team_jam.lead = lead

        return team_jam.jam.bout, team_jam.jam
