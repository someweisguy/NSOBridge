from core.models import Gettable, ProjectModel
from core.models.bout.jam import TeamJam


class SetLost(ProjectModel):
    def __call__(self, team_jam: TeamJam, lost: bool) -> tuple[Gettable, ...]:
        team_jam.lost = lost

        return team_jam.jam.bout, team_jam.jam
