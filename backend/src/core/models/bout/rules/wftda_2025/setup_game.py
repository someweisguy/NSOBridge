from datetime import timedelta
from typing import ClassVar

from core.models import Gettable, ProjectModel
from core.models.bout.bout import Bout
from core.models.bout.jam import Jam, TeamJam


class SetupGame(ProjectModel):
    PERIOD_DURATION: ClassVar[timedelta] = timedelta(minutes=30)
    LINEUP_DURATION: ClassVar[timedelta] = timedelta(seconds=30)
    JAM_DURATION: ClassVar[timedelta] = timedelta(minutes=2)

    NUM_TIMEOUTS: ClassVar[int] = 3
    NUM_REVIEWS: ClassVar[int] = 1

    @staticmethod
    def score_strategy(team_jam: TeamJam) -> int:
        OVERTIME_PERIOD_NUM: int = 2
        sum_start_trip: int = int(team_jam.jam.period_num < OVERTIME_PERIOD_NUM)
        score: int = sum(trip.points for trip in team_jam.trips[sum_start_trip:])
        return score

    def __call__(self, bout: Bout) -> tuple[Gettable, ...]:
        # Initialize clocks
        bout.clocks.game.set_alarm(self.PERIOD_DURATION)
        bout.clocks.lineup.set_alarm(self.LINEUP_DURATION)
        bout.clocks.jam.set_alarm(self.JAM_DURATION)

        # Initialize Teams
        for team in bout.teams:
            team.timeouts = self.NUM_TIMEOUTS
            team.reviews = self.NUM_REVIEWS
            team.set_score_strategy(self.score_strategy)

        # Assign Teams to the initial Jam
        initial_jam: Jam = bout.get_latest_jam()
        initial_jam.assign_teams(bout.teams)

        return (bout,)
