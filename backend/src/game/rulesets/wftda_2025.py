"""Models and Business logic pertaining to the WFTDA 2025 ruleset."""

from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import TYPE_CHECKING, override

from core.exceptions import GameRulesError, GameStateError

from game.jams.models import Jam
from game.team_jams.models import TeamJam
from game.timeouts.models import BaseTimeout
from game.trip_events.models import TripEvent

from .mutate import RuleMutator

if TYPE_CHECKING:
    from game.teams.models import Team


class WFTDA2025(RuleMutator):
    """The mutator which describes the WFTDA 2025 ruleset."""

    REQUIRED_NUM_TEAMS: int = 2
    NUM_TIMEOUTS: int = 3
    NUM_REVIEWS: int = 1
    NUM_PERIODS: int = 2
    POINTS_PER_TRIP: int = 4

    @override
    def init_bout(self) -> None:
        self.bout.ruleset_name = 'WFTDA 2025'
        self.bout.clock.alarm = timedelta(minutes=30)
        for team in self.bout.teams:
            team.timeouts_remaining = self.NUM_TIMEOUTS
            team.reviews_remaining = self.NUM_REVIEWS
        self.bout.jams.append(Jam(0, 0, *[TeamJam(team) for team in self.bout.teams]))

    @override
    def begin_period(self, timestamp: datetime) -> None:
        jam: Jam | None = self.get_upcoming_jam()
        if jam is None:
            raise GameStateError('There is no upcoming Jam in this period')
        if jam.period == self.NUM_PERIODS:
            raise GameRulesError(f'This Bout can only have {self.NUM_PERIODS} periods')

        logging.info(f'Beginning P{jam.period} in {self}')

        # If this Period is not in overtime reset the Clock and Official Reviews
        if jam.period < self.NUM_PERIODS:
            self.bout.clock.reset()
            for team in self.bout.teams:
                team.reviews_remaining = 1

        self.bout.is_running = True

    @override
    def end_period(self, timestamp: datetime) -> None:
        running_jam: Jam | None = self.get_running_jam()
        running_timeout: BaseTimeout | None = self.get_running_timeout()
        if running_jam is not None or running_timeout is not None:
            raise GameRulesError('A period can only be ended during a lineup')
        if not self.bout.is_running:
            raise GameStateError('There is no running period to end')

        final_jam: Jam = self.bout.jams[-1]
        logging.info(f'Ending P{final_jam.period} in {self}')

        # Calling end_period() twice in a row after Period 2 ends the Bout
        # Or calling end_period() after OT ends the Bout
        if not self.bout.is_running or self.bout.jams[-1].period == self.NUM_PERIODS:
            self.bout.is_final = True

        if self.bout.clock.is_running():
            self.bout.clock.stop(timestamp)

        # Update the final Jam
        if len(self.bout.jams) > 0:
            if self.bout.is_final:
                # Cull the final Jam
                self.bout.jams.remove(final_jam)
            elif final_jam.start_timestamp is None:
                # Set the final Jam to be the first Jam in the next Period
                final_jam.period += 1
                final_jam.num = 0

        self.bout.is_running = False

    @override
    def start_jam(self, timestamp: datetime) -> None:
        running_timeout: BaseTimeout | None = self.get_running_timeout()
        if not self.bout.is_running:
            # Allow user to skip the initial call to begin_period()
            self.begin_period(timestamp)
        if running_timeout is not None:
            # Allow the user to end a Timeout and immediately start the next Jam
            self.stop_timeout(timestamp)
            running_timeout = None

        running_jam: Jam | None = self.get_running_jam()
        if running_jam is not None:
            raise GameRulesError('A Jam may only be started from lineup')

        # Get the first Jam that has not started
        jam: Jam | None = self.get_upcoming_jam()
        if jam is None:
            raise NotImplementedError()  # TODO: push a new Jam if this is None
        if len(jam.team_jams) != self.REQUIRED_NUM_TEAMS:
            raise RuntimeError(f'each Jam requires {self.REQUIRED_NUM_TEAMS} TeamJams')

        logging.info(f'Starting {jam}')

        # Start the Clock if not in overtime
        if jam.period < self.NUM_PERIODS and not self.bout.clock.is_running():
            self.bout.clock.start(timestamp)
        jam.start(timestamp)

        # Push a new Jam to allow users to prefetch it
        self.bout.jams.append(
            Jam(jam.period, jam.num + 1, *[TeamJam(team) for team in self.bout.teams])
        )

    @override
    def stop_jam(self, timestamp: datetime) -> None:
        jam: Jam | None = self.get_running_jam()
        if jam is None:
            raise GameStateError('There is no running Jam to stop')

        logging.info(f'Stopping {jam}')

        jam.stop(timestamp)

        # TODO: Attempt to guess the reason that the Jam ended

    @override
    def start_timeout(self, timestamp: datetime) -> None:
        running_jam: Jam | None = self.get_running_jam()
        if running_jam is not None:
            # Allow the user to end the Jam and immediately start a Timeout
            self.stop_jam(timestamp)
            running_jam = None

        running_timeout: BaseTimeout | None = self.get_running_timeout()
        if running_timeout is not None:
            raise GameStateError('A Timeout cannot be called while one is in progress')

        logging.info(f'Calling Timeout {self}')

        # Instantiate and start the Timeout
        timeout: BaseTimeout = BaseTimeout(
            self.get_active_jam(), len(self.bout.timeouts)
        )
        timeout.clock_elapsed = self.bout.clock.get_duration(timestamp)
        timeout.start(timestamp)
        self.bout.timeouts.append(timeout)

        if self.bout.clock.is_running():
            self.bout.clock.stop(timestamp)

    @override
    def stop_timeout(self, timestamp: datetime) -> None:
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

    @override
    def add_trip(self, team: Team, timestamp: datetime, passes: int) -> None:
        jam: Jam = self.get_active_jam()
        team_jam: TeamJam = jam.get_team_jam(team)

        logging.info(f'Adding {passes} passes to {team} in {self}')

        is_initial: bool = team_jam.get_num_trips() == 0
        is_overtime: bool = jam.period >= self.NUM_PERIODS
        if is_initial:
            logging.info(f'This is the initial pass for {team} in {self}')

        event: TripEvent = TripEvent(timestamp, passes=passes)

        # Automatically set lead on the first 4-point trip
        if not jam.lead_is_declared() and passes == self.POINTS_PER_TRIP:
            self.add_lead(team, timestamp, True)

        # Lose eligibility on initial no-pass/no-penalty
        if len(team_jam.events) == 0 and passes < self.POINTS_PER_TRIP:
            self.add_lost(team, timestamp, True)

        # Jammer cannot earn points on the initial pass
        if is_initial and not is_overtime:
            event.passes = 0

        team_jam.events.append(event)

    @override
    def add_lead(self, team: Team, timestamp: datetime, lead: bool) -> None:
        jam: Jam = self.get_active_jam()
        team_jam: TeamJam = jam.get_team_jam(team)

        logging.info(f'{"Setting" if lead else "Unsetting"} lead for {team} in {self}')

        if lead:
            # Add a new Trip Event in which lead is declared
            if jam.lead_is_declared():
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
    def add_lost(self, team: Team, timestamp: datetime, lost: bool) -> None:
        jam: Jam = self.get_active_jam()
        team_jam: TeamJam = jam.get_team_jam(team)

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
    def add_star_pass(self, team: Team, timestamp: datetime, star_pass: bool) -> None:
        jam: Jam = self.get_active_jam()
        team_jam: TeamJam = jam.get_team_jam(team)

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


# class Timeout(BaseTimeout):
#     """A Timeout model using the WFTDA 2025 ruleset."""

#     @override
#     def set_type(self, is_review: bool) -> None:
#         logging.info(
#             f'Setting {self} to {"official review" if is_review else "timeout"} type '
#             f'in Bout ID {self.bout_uuid}'
#         )

#         self.is_review = is_review

#     @override
#     def set_team(self, team: Team | None) -> None:
#         if team is not None and team.bout_uuid != self.bout_uuid:
#             raise GameStateError('Team and timeout are not part of the same Bout')
#         if team is None and self.is_review:
#             raise GameRulesError('Official reviews can only be called by teams')

#         logging.info(
#             f'Setting {self} calling team to {team or "officials"} in Bout ID '
#             f'{self.bout_uuid}'
#         )

#         self.team = team
#         self.team_is_officials = team is None

#     @override
#     def set_retained(self, retained: bool) -> None:
#         logging.info(
#             f'Setting {self} to {"" if retained else "un"}retained in Bout ID '
#             f'{self.bout_uuid}'
#         )

#         self.retained = retained
