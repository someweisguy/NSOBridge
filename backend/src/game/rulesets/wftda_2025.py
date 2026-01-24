"""Models and Business logic pertaining to the WFTDA 2025 ruleset."""

import logging
from datetime import datetime, timedelta
from typing import ClassVar, override

from core.exceptions import GameRulesError, GameStateError
from game.bouts.models import REQUIRED_NUM_TEAMS, BaseBout
from game.jams.models import BaseJam
from game.skaters.models import Roster
from game.team_jams.models import TeamJam
from game.teams.models import BaseTeam
from game.timeouts.models import BaseTimeout
from game.trip_events.models import TripEvent

from .schemas import Ruleset

RULESET_NAME = 'WFTDA 2025'


class _WFTDAModel:
    __mapper_args__: dict[str, str] = {
        'polymorphic_identity': RULESET_NAME,
    }


# TODO: Figure out a method to forfeit a Bout


class Bout(_WFTDAModel, BaseBout):
    """A Bout model using the WFTDA 2025 ruleset."""

    ruleset: ClassVar[Ruleset] = Ruleset(
        name=RULESET_NAME,
        num_periods=2,
        jam_duration=timedelta(minutes=2),
        lineup_duration=timedelta(seconds=30),
        points_per_trip=4,
        num_timeouts=3,
        num_reviews=1,
    )

    @override
    def __init__(self, home: Roster, away: Roster) -> None:
        super().__init__(
            RULESET_NAME,
            Team(home, 0),
            Team(away, 1),
        )
        self.clock.alarm = timedelta(minutes=30)
        self.jams.append(Jam(0, 0, *[TeamJam(team) for team in self.teams]))
        self.timeouts.append(Timeout(self, 0))

    @override
    async def begin_period(self, timestamp: datetime) -> None:
        jam: BaseJam | None = self.get_upcoming_jam()
        if jam is None:
            raise GameStateError('There is no upcoming Jam in this period')
        if jam.period == Bout.ruleset.num_periods:
            raise GameRulesError(
                f'This Bout can only have {Bout.ruleset.num_periods} periods'
            )

        logging.info(f'Beginning P{jam.period} in {self}')

        # If this Period is not in overtime reset the Clock and Official Reviews
        if jam.period < Bout.ruleset.num_periods:
            self.clock.reset()
            for team in self.teams:
                team.reviews_remaining = 1

        self.is_running = True

    @override
    async def end_period(self, timestamp: datetime) -> None:
        running_jam: BaseJam | None = self.get_running_jam()
        running_timeout: BaseTimeout | None = self.get_running_timeout()
        if running_jam is not None or running_timeout is not None:
            raise GameRulesError('A period can only be ended during a lineup')
        if not self.is_running:
            raise GameStateError('There is no running period to end')

        final_jam: BaseJam = self.jams[-1]
        logging.info(f'Ending P{final_jam.period} in {self}')

        # Calling end_period() twice in a row after Period 2 ends the Bout
        # Or calling end_period() after OT ends the Bout
        if not self.is_running or self.jams[-1].period == Bout.ruleset.num_periods:
            self.is_final = True

        if self.clock.is_running():
            self.clock.stop(timestamp)

        # Update the final Jam
        if len(self.jams) > 0:
            if self.is_final:
                # Cull the final Jam
                self.jams.remove(final_jam)
            elif final_jam.start_timestamp is None:
                # Set the final Jam to be the first Jam in the next Period
                final_jam.period += 1
                final_jam.num = 0

        self.is_running = False

    @override
    async def start_jam(self, timestamp: datetime) -> BaseJam:
        running_timeout: BaseTimeout | None = self.get_running_timeout()
        if not self.is_running:
            # Allow user to skip the initial call to begin_period()
            await self.begin_period(timestamp)
        if running_timeout is not None:
            # Allow the user to end a Timeout and immediately start the next Jam
            await self.stop_timeout(timestamp)
            running_timeout = None

        running_jam: BaseJam | None = self.get_running_jam()
        if running_jam is not None:
            raise GameRulesError('A Jam may only be started from lineup')

        # Get the first Jam that has not started
        jam: BaseJam | None = self.get_upcoming_jam()
        if jam is None:
            raise NotImplementedError()  # FIXME: push a new Jam if this is None
        if len(jam.team_jams) != REQUIRED_NUM_TEAMS:
            raise RuntimeError(f'each Jam requires {REQUIRED_NUM_TEAMS} TeamJams')

        logging.info(f'Starting {jam}')

        # Start the Clock if not in overtime
        if jam.period < Bout.ruleset.num_periods and not self.clock.is_running():
            self.clock.start(timestamp)
        jam.start(timestamp)

        # Push a new Jam to allow users to prefetch it
        self.jams.append(
            Jam(jam.period, jam.num + 1, *[TeamJam(team) for team in self.teams])
        )

        return jam

    @override
    async def stop_jam(self, timestamp: datetime) -> BaseJam:
        jam: BaseJam | None = self.get_running_jam()
        if jam is None:
            raise GameStateError('There is no running Jam to stop')

        logging.info(f'Stopping {jam}')

        jam.stop(timestamp)

        # TODO: Attempt to guess the reason that the Jam ended

        return jam

    @override
    async def start_timeout(self, timestamp: datetime) -> BaseTimeout:
        running_jam: BaseJam | None = self.get_running_jam()
        if running_jam is not None:
            # Allow the user to end the Jam and immediately start a Timeout
            await self.stop_jam(timestamp)
            running_jam = None

        running_timeout: BaseTimeout | None = self.get_running_timeout()
        if running_timeout is not None:
            raise GameStateError('A Timeout cannot be called while one is in progress')

        logging.info(f'Calling Timeout {self}')

        # Instantiate and start the Timeout
        timeout: BaseTimeout | None = self.get_upcoming_timeout()
        if timeout is None:
            raise NotImplementedError()  # FIXME push a new Timeout

        timeout.clock_elapsed = self.clock.get_duration(timestamp)
        timeout.start(timestamp)

        if self.clock.is_running():
            self.clock.stop(timestamp)

        # Push a new Timeout to allow users to prefetch it
        self.timeouts.append(Timeout(self, timeout.num + 1))

        return timeout

    @override
    async def stop_timeout(self, timestamp: datetime) -> BaseTimeout:
        timeout: BaseTimeout | None = self.get_running_timeout()
        if timeout is None:
            raise GameStateError('There is no active Timeout to stop')

        logging.info(f'Stopping Timeout in {self}')

        # Validate the Timeout's state
        if timeout.is_review and timeout.team is None:
            raise GameRulesError('Officials cannot call an official review')

        # Stop the Timeout
        timeout.stop(timestamp)

        # Subtract remaining Timeouts or Official Reviews as appropriate
        if timeout.team is not None:
            if timeout.is_review and not timeout.retained:
                timeout.team.reviews_remaining -= 1
            elif not timeout.is_review:
                timeout.team.timeouts_remaining -= 1

        return timeout


class Team(_WFTDAModel, BaseTeam):
    """A Team model using the WFTDA 2025 ruleset."""

    @override
    def __init__(self, roster: Roster, team_num: int) -> None:
        super().__init__(roster, team_num)
        self.timeouts_remaining = Bout.ruleset.num_timeouts
        self.reviews_remaining = Bout.ruleset.num_reviews

    @classmethod
    @override
    def get_team_jam_score(cls, team_jam: TeamJam) -> int:
        jam_score: int = 0
        for event in team_jam.events:
            if event.passes is not None:
                jam_score += event.passes
        return jam_score


class Jam(_WFTDAModel, BaseJam):
    """A Jam model using the WFTDA 2025 ruleset."""

    @override
    async def add_trip(self, team: BaseTeam, timestamp: datetime, passes: int) -> None:
        team_jam: TeamJam = self.get_team_jam(team)

        logging.info(f'Adding {passes} passes to {team} in {self}')

        is_initial: bool = len(team_jam.events) == 0
        is_overtime: bool = self.period >= Bout.ruleset.num_periods
        if is_initial:
            logging.info(f'This is the initial pass for {team} in {self}')

        event: TripEvent = TripEvent(timestamp, passes=passes)

        # Automatically set lead on the first 4-point trip
        if not self.lead_is_declared() and passes == Bout.ruleset.points_per_trip:
            await self.set_lead(team, timestamp, True)

        # Lose eligibility on initial no-pass/no-penalty
        if len(team_jam.events) == 0 and passes < Bout.ruleset.points_per_trip:
            await self.set_lost(team, timestamp, True)

        # Jammer cannot earn points on the initial pass
        if is_initial and not is_overtime:
            event.passes = 0

        team_jam.events.append(event)

    @override
    async def set_lead(self, team: BaseTeam, timestamp: datetime, lead: bool) -> None:
        team_jam: TeamJam = self.get_team_jam(team)

        logging.info(f'{"Setting" if lead else "Unsetting"} lead for {team} in {self}')

        if lead:
            # Add a new Trip Event in which lead is declared
            if self.lead_is_declared():
                raise GameRulesError('A lead jammer has already been declared')
            event: TripEvent = TripEvent(timestamp, lead=lead)
            team_jam.events.append(event)
        else:
            for event in team_jam.events:
                if event.lead:
                    break
            event.lead = lead
            if event.is_empty():
                team_jam.events.remove(event)

    @override
    async def set_lost(self, team: BaseTeam, timestamp: datetime, lost: bool) -> None:
        team_jam: TeamJam = self.get_team_jam(team)

        logging.info(f'{"Setting" if lost else "Unsetting"} lost for {team} in {self}')

        if lost:
            # Add a new Trip Event in which the Jammer has lost eligibility for lead
            if any(event.lost for event in team_jam.events):
                raise GameRulesError('This team has already lost lead eligibility')
            event: TripEvent = TripEvent(timestamp, lost=lost)
            team_jam.events.append(event)
        else:
            for event in team_jam.events:
                if event.lost:
                    break
            event.lost = lost
            if event.is_empty():
                team_jam.events.remove(event)

    @override
    async def set_star_pass(
        self, team: BaseTeam, timestamp: datetime, star_pass: bool
    ) -> None:
        team_jam: TeamJam = self.get_team_jam(team)

        logging.info(
            f'{"Setting" if star_pass else "Unsetting"} star pass {team} in {self}'
        )

        if star_pass:
            if any(event.star_pass for event in team_jam.events):
                raise GameRulesError(
                    'This team has already completed a star pass in this Jam'
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


class Timeout(_WFTDAModel, BaseTimeout):
    """A Timeout model using the WFTDA 2025 ruleset."""

    @override
    def set_type(self, is_review: bool) -> None:
        logging.info(
            f'Setting {self} to {"official review" if is_review else "timeout"} type '
            f'in Bout ID {self.bout_uuid}'
        )

        self.is_review = is_review

    @override
    def set_team(self, team: BaseTeam | None) -> None:
        if team is not None and team.bout_uuid != self.bout_uuid:
            raise GameStateError('Team and timeout are not part of the same Bout')
        if team is None and self.is_review:
            raise GameRulesError('Official reviews can only be called by teams')

        logging.info(
            f'Setting {self} calling team to {team or "officials"} in Bout ID '
            f'{self.bout_uuid}'
        )

        self.team = team
        self.team_is_officials = team is None

    @override
    def set_retained(self, retained: bool) -> None:
        logging.info(
            f'Setting {self} to {"" if retained else "un"}retained in Bout ID '
            f'{self.bout_uuid}'
        )

        self.retained = retained
