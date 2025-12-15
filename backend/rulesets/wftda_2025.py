from datetime import datetime, timedelta
from typing import ClassVar, override

from exceptions import RulesError
from game.bouts.models import BaseBout
from game.jams.models import BaseJam
from game.rosters.models import Roster
from game.series.models import Series
from game.team_jams.models import TeamJam
from game.teams.models import BaseTeam
from game.timeouts.models import BaseTimeout
from game.trip_events.models import TripEvent

from .schemas import RulesetContext

RULESET_NAME = 'WFTDA 2025'


class WFTDAModel:
    __mapper_args__: dict[str, str] = {
        'polymorphic_identity': RULESET_NAME,
    }


# TODO: Figure out a method to forfeit a Bout


class Bout(WFTDAModel, BaseBout):
    rules: ClassVar[RulesetContext] = RulesetContext(
        name=RULESET_NAME,
        num_periods=2,
        jam_duration=timedelta(minutes=2),
        lineup_duration=timedelta(seconds=30),
        points_per_trip=4,
        num_timeouts=3,
        num_reviews=1,
    )

    def __init__(self, series: Series, home: Roster, away: Roster) -> None:
        super().__init__(series=series, ruleset=self.rules.name)
        self.clock.alarm = timedelta(minutes=30)
        self.teams.extend((Team(home), Team(away)))
        for team in self.teams:
            team.timeouts_remaining = self.rules.num_timeouts
            team.reviews_remaining = self.rules.num_reviews
        initial_jam: Jam = Jam(
            0,
            0,
            [self.teams[0], self.teams[1]],
        )
        self.jams.append(initial_jam)

    @override
    def begin_period(self, timestamp: datetime) -> None:
        if self.state != 'stopped':
            raise RulesError('this bout cannot be started now')
        if len(self.jams) > 0 and self.jams[-1].period == self.rules.num_periods:
            raise RulesError(
                f'this bout can only have {self.rules.num_periods} periods'
            )

        # If this Period is not in overtime reset the Clock
        if self.jams[-1].period < self.rules.num_periods:
            self.clock.reset()

        self.is_running = True

    @override
    def end_period(self, timestamp: datetime) -> None:
        if self.is_running and self.state != 'lineup':
            raise RulesError('the period can only be ended during lineup')
        if not self.is_running and self.jams[-1].period < self.rules.num_periods:
            raise RulesError('there is no running period to end')

        # Calling end_period() twice in a row after Period 2 ends the Bout
        if not self.is_running:
            self.is_final = True

        if self.clock.is_running():
            self.clock.stop(timestamp)

        # Update the final Jam
        if len(self.jams) > 0:
            final_jam: BaseJam = self.jams[-1]
            if self.is_final:
                # Cull the final Jam
                self.jams.remove(final_jam)
            elif final_jam.start_timestamp is None:
                # Set the final Jam to be the first Jam in the next Period
                final_jam.period += 1
                final_jam.num = 0

        self.is_running = False

    @override
    def start_jam(self, timestamp: datetime) -> BaseJam:
        if not self.is_running:
            # Allow user to skip the initial call to begin_period()
            self.begin_period(timestamp)
        if self.state == 'timeout':
            # Allow the user to end a Timeout and immediately start the next Jam
            self.stop_timeout(timestamp)

        if self.state != 'lineup':
            raise RulesError('a jam may only be started from lineup')

        # Start the Clock if not in overtime
        jam: BaseJam = self.jams[-1]
        if jam.period < self.rules.num_periods and not self.clock.is_running():
            self.clock.start(timestamp)

        jam.start(timestamp)
        return jam

    @override
    def stop_jam(self, timestamp: datetime) -> BaseJam:
        if self.state != 'jam':
            raise RulesError('there is no running jam to stop')

        jam: BaseJam = self.jams[-1]
        jam.stop(timestamp)

        # Push a new Jam to the queue to allow users to immediately fill out the Lineup
        period_num: int = self.jams[-1].period
        jam_num: int = self.jams[-1].num + 1
        home, away = self.teams[:2]
        self.jams.append(
            Jam(
                period_num,
                jam_num,
                [home, away],
            )
        )

        return jam

    @override
    def start_timeout(self, timestamp: datetime) -> BaseTimeout:
        if self.state == 'jam':
            # Allow the user to end the Jam and immediately start a Timeout
            self.stop_jam(timestamp)

        if self.state != 'lineup':
            raise RulesError('a timeout cannot be called now')

        # Instantiate and start the Timeout
        clock_elapsed: timedelta = self.clock.get_duration(timestamp)
        timeout: Timeout = Timeout(clock_elapsed)
        self.timeouts.append(timeout)
        timeout.start(timestamp)

        if self.clock.is_running():
            self.clock.stop(timestamp)

        return timeout

    @override
    def stop_timeout(self, timestamp: datetime) -> BaseTimeout:
        if self.state != 'timeout':
            raise RulesError('there is no active timeout to stop')

        # Validate the Timeout's state
        timeout: BaseTimeout = self.timeouts[-1]
        if timeout.is_review and timeout.team is None:
            raise RulesError('officials cannot call an official review')

        # Stop the Timeout
        timeout.stop(timestamp)

        # Subtract remaining Timeouts or Official Reviews as appropriate
        if timeout.team is not None:
            if timeout.is_review and not timeout.retained:
                timeout.team.reviews_remaining -= 1
            elif not timeout.is_review:
                timeout.team.reviews_remaining -= 1

        return timeout


class Team(WFTDAModel, BaseTeam):
    @classmethod
    @override
    def get_team_jam_score(cls, team_jam: TeamJam) -> int:
        jam_score: int = 0
        for event in team_jam.events:
            if event.passes is not None:  # TODO: can event.passes be non-nullable?
                jam_score += event.passes
        return jam_score


class Jam(WFTDAModel, BaseJam):
    def __init__(
        self,
        period_num: int,
        jam_num: int,
        teams: list[BaseTeam],
    ) -> None:
        super().__init__(
            period=period_num,
            num=jam_num,
            team_jams=[TeamJam(team) for team in teams],
        )

    async def add_trip(self, team_id: int, timestamp: datetime, passes: int) -> None:
        team_jam: TeamJam = self.get_team_jam_by_team(team_id)

        event: TripEvent = TripEvent(timestamp, passes=passes)

        # TODO: handle overtime conditions

        # Automatically set lead on the first 4-point trip
        if not self.lead_is_declared() and passes == self.bout.rules.points_per_trip:
            event.lead = True

        # Lose eligibility on initial no-pass/no-penalty
        if len(team_jam.events) == 0 and passes < self.bout.rules.points_per_trip:
            event.lost = True

        # Jammer cannot earn points on the initial pass
        if len(team_jam.events) == 0:
            event.passes = 0

        team_jam.events.append(event)

    async def set_lead(self, team_id: int, timestamp: datetime, lead: bool) -> None:
        team_jam: TeamJam = self.get_team_jam_by_team(team_id)

        if lead:
            # Add a new Trip Event in which lead is declared
            if self.lead_is_declared():
                raise RulesError('a lead jammer has already been declared')
            event: TripEvent = TripEvent(timestamp, lead=lead)
            team_jam.events.append(event)
        else:
            for event in team_jam.events:
                if event.lead:
                    break
            event.lead = lead
            if event.is_empty():
                team_jam.events.remove(event)

    async def set_lost(self, team_id: int, timestamp: datetime, lost: bool) -> None:
        team_jam: TeamJam = self.get_team_jam_by_team(team_id)

        if lost:
            # Add a new Trip Event in which the Jammer has lost eligibility for lead
            if any(event.lost for event in team_jam.events):
                raise RulesError('this team has already lost lead eligibility')
            event: TripEvent = TripEvent(timestamp, lost=lost)
            team_jam.events.append(event)
        else:
            for event in team_jam.events:
                if event.lost:
                    break
            event.lost = lost
            if event.is_empty():
                team_jam.events.remove(event)

    async def set_star_pass(
        self, team_id: int, timestamp: datetime, star_pass: bool
    ) -> None:
        team_jam: TeamJam = self.get_team_jam_by_team(team_id)

        if star_pass:
            if any(event.star_pass for event in team_jam.events):
                raise RulesError(
                    'this team has already completed a star pass in this Jam'
                )
            event: TripEvent = TripEvent(timestamp, star_pass=star_pass)
            if not any(event.lost for event in team_jam.events):
                event.lost = True  # Removing the star makes one ineligible for Lead
            team_jam.events.append(event)
        else:
            for event in team_jam.events:
                if event.star_pass:
                    break
            event.star_pass = star_pass
            if event.lost:
                event.lost = False  # Assume the Star Pass was the ineligibility event
            if event.is_empty():
                team_jam.events.remove(event)


class Timeout(WFTDAModel, BaseTimeout):
    def set_type(self, is_review: bool) -> None:
        self.is_review = is_review

    def set_team(self, team: BaseTeam | None) -> None:
        if team is not None and team.bout_id != self.bout_id:
            raise ValueError('team and timeout are not part of the same Bout')
        if team is None and self.is_review:
            raise RulesError('official reviews can only be called by teams')
        
        self.team = team
        self.team_is_officials = team is None
    
    def set_retained(self, retained: bool) -> None:
        self.retained = retained
