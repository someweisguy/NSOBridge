from core.models import Gettable, ProjectModel
from core.models.bout.jam import TeamJam


class SetStarPass(ProjectModel):
    def __call__(self, team_jam: TeamJam, star_pass: bool) -> tuple[Gettable, ...]:
        if star_pass:
            team_jam.star_pass = len(team_jam.trips)
        else:
            team_jam.star_pass = None

        return team_jam.jam.bout, team_jam.jam
