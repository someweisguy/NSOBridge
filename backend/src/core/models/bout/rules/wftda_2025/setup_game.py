from dataclasses import dataclass
from datetime import timedelta
from typing import Final

from core import updater
from core.models import ModelKey
from core.models.bout.bout import Bout
from core.models.bout.jam import Jam, TeamJam


@dataclass(slots=True)
class SetupGame:
    PERIOD_DURATION: Final[timedelta] = timedelta(minutes=30)
    LINEUP_DURATION: Final[timedelta] = timedelta(seconds=30)
    JAM_DURATION: Final[timedelta] = timedelta(minutes=2)

    NUM_TIMEOUTS: Final[int] = 3
    NUM_REVIEWS: Final[int] = 1

    @staticmethod
    def score_strategy(team_jam: TeamJam) -> int:
        OVERTIME_PERIOD_NUM: int = 2
        score: int = sum(trip.points for trip in team_jam.trips[1:])
        if team_jam.id.period == OVERTIME_PERIOD_NUM:
            score += team_jam.trips[0].points
        return score

    def __call__(self, bout: Bout) -> ModelKey:
        # Initialize clocks
        bout.clocks.game.set_alarm(self.PERIOD_DURATION)
        bout.clocks.lineup.set_alarm(self.LINEUP_DURATION)
        bout.clocks.jam.set_alarm(self.JAM_DURATION)

        # Initialize Teams
        for team in bout.teams:
            team.timeouts = self.NUM_TIMEOUTS
            team.reviews = self.NUM_REVIEWS
            team.set_score_strategy(self.score_strategy)
            
        # Push initial Period and Jam
        bout.push_period()
        initial_jam: Jam = bout.push_jam()
        initial_jam.team_jams = bout.teams
        
        return updater.kf.bout(bout.id)
