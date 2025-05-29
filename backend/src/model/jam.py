from datetime import datetime
from typing import Literal

from pydantic import Field

from model.project import ProjectModel
from model.team import TeamAttribute, TeamString
from model.timer import Timer

type JamId = tuple[int, int]
type StopReason = Literal['called', 'time', 'injury', 'other']


class Score(ProjectModel):
    class Trip(ProjectModel):
        points: int
        timestamp: datetime

    lead: bool = False
    lost: bool = False
    star_pass: int | None = None
    trips: list[Trip] = Field([], final=True)


class TeamJam(ProjectModel):
    score: Score = Field(Score(), final=True)


class Jam(TeamAttribute[TeamJam], Timer):
    stop_reason: StopReason | None = None

    def __init__(self) -> None:
        super().__init__(home=TeamJam(), away=TeamJam())

    def lead_is_declared(self) -> bool:
        return self.home.score.lead or self.away.score.lead

    def get_jam_score(self, team: TeamString) -> int:
        score: Score = self[team].score
        return sum([trip.points for trip in score.trips])
