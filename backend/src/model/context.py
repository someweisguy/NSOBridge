from datetime import timedelta
from typing import ClassVar

from pydantic import Field

from model.jam import Jam
from model.project import ProjectModel
from model.team import Team, TeamAttribute
from model.timer import Clock, Timeout


class RefereeContext(TeamAttribute[Team]):
    PERIOD_DURATION: ClassVar[timedelta] = timedelta(minutes=30)
    JAM_DURATION: ClassVar[timedelta] = timedelta(minutes=2)
    LINEUP_DURATION: ClassVar[timedelta] = timedelta(seconds=30)

    class Clocks(ProjectModel):
        intermission: Clock = Field(Clock(), final=True)
        game: Clock = Field(Clock(), final=True)
        lineup: Clock = Field(Clock(), final=True)
        jam: Clock = Field(Clock(), final=True)

    clocks: Clocks = Field(Clocks(), final=True)
    jams: tuple[list[Jam], list[Jam]] = Field(([Jam()], []), exclude=True, final=True)
    timeouts: list[Timeout] = Field([], final=True)
    home: Team = Field(Team())
    away: Team = Field(Team())
    # TODO: add Officials
