"""Models and Business logic pertaining to the WFTDA 2025 ruleset."""

from __future__ import annotations

import logging
from datetime import datetime, timedelta
from http import HTTPStatus
from typing import TYPE_CHECKING, Any, final, override

from fastapi import HTTPException
from game.bouts.models import REQUIRED_NUM_TEAMS, BaseBout
from game.bouts.schemas import RulesetSchema
from game.jams.models import Jam, TeamJam, TripEvent
from game.timeouts.models import Timeout

if TYPE_CHECKING:
    from game.bouts.models import Team

RULESET_NAME: str = 'WFTDA 2025'


@final
class Bout(BaseBout):
    """The mutator which describes the WFTDA 2025 ruleset."""

    __mapper_args__: dict[str, Any] = {'polymorphic_identity': RULESET_NAME}

    ruleset = RulesetSchema(
        name=RULESET_NAME,
        num_periods=2,
        jam_duration=timedelta(minutes=2),
        lineup_duration=timedelta(seconds=30),
        points_per_trip=4,
        num_timeouts=3,
        num_reviews=1,
    )

    @override
    def setup(self) -> None:
        logging.info(f'Instantiating a Bout using the {self.ruleset.name} ruleset.')
        self.clock.alarm = timedelta(minutes=30)
        for team in self.teams:
            team.timeouts_remaining = self.ruleset.num_timeouts
            team.reviews_remaining = self.ruleset.num_reviews
        jam: Jam = Jam(0, 0, *[TeamJam(team) for team in self.teams])
        self.jams.append(jam)

    @override
    def begin_period(self, timestamp: datetime) -> None:
        jam: Jam | None = self.get_upcoming_jam()
        if jam is None:
            raise HTTPException(
                HTTPStatus.CONFLICT, 'There is no upcoming Jam in this period'
            )
        if jam.period == self.ruleset.num_periods:
            raise HTTPException(
                HTTPStatus.CONFLICT,
                f'This Bout can only have {self.ruleset.num_periods} periods',
            )

        logging.info(f'Readying P{jam.period} in {self}')

        # If this Period is not in overtime reset the Clock and Official Reviews
        if jam.period < self.ruleset.num_periods:
            self.clock.reset()
            for team in self.teams:
                team.reviews_remaining = 1

        self.is_running = True

    @override
    def end_period(self, timestamp: datetime) -> None:
        running_jam: Jam | None = self.get_running_jam()
        running_timeout: Timeout | None = self.get_running_timeout()
        if running_jam is not None or running_timeout is not None:
            raise HTTPException(
                HTTPStatus.CONFLICT, 'A period can only be ended during a lineup'
            )
        if not self.is_running:
            raise HTTPException(
                HTTPStatus.CONFLICT, 'There is no running period to end'
            )

        final_jam: Jam = self.jams[-1]
        if final_jam.num == 0 and final_jam.stop_timestamp is None:
            raise HTTPException(
                HTTPStatus.CONFLICT, 'One Jam must be played before ending the Period'
            )
        logging.info(f'Ending P{final_jam.period + 1} in {self}')

        # Calling end_period() twice in a row after Period 2 ends the Bout
        # Or calling end_period() after OT ends the Bout
        if not self.is_running or self.jams[-1].period == self.ruleset.num_periods:
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
    def start_jam(self, timestamp: datetime) -> None:
        running_timeout: Timeout | None = self.get_running_timeout()
        if not self.is_running:
            # Allow user to skip the initial call to begin_period()
            self.begin_period(timestamp)
        if running_timeout is not None:
            # Allow the user to end a Timeout and immediately start the next Jam
            self.stop_timeout(timestamp)
            running_timeout = None

        running_jam: Jam | None = self.get_running_jam()
        if running_jam is not None:
            raise HTTPException(
                HTTPStatus.CONFLICT, 'A Jam may only be started from lineup'
            )

        # Get the first Jam that has not started
        jam: Jam | None = self.get_upcoming_jam()
        if jam is None:
            raise NotImplementedError()  # TODO: push a new Jam if this is None
        if len(jam.team_jams) != REQUIRED_NUM_TEAMS:
            raise RuntimeError(f'each Jam requires {REQUIRED_NUM_TEAMS} TeamJams')

        logging.info(f'Starting {jam}')

        # Start the Clock if not in overtime
        if jam.period < self.ruleset.num_periods and not self.clock.is_running():
            self.clock.start(timestamp)
        jam.start(timestamp)

        # Push a new Jam to allow users to prefetch it
        self.jams.append(
            Jam(jam.period, jam.num + 1, *[TeamJam(team) for team in self.teams])
        )

    @override
    def stop_jam(self, timestamp: datetime) -> None:
        jam: Jam | None = self.get_running_jam()
        if jam is None:
            raise HTTPException(HTTPStatus.CONFLICT, 'There is no running Jam to stop')

        logging.info(f'Stopping {jam}')

        jam.stop(timestamp)

        # Attempt to guess the reason that the Jam ended
        if self.ruleset.jam_duration - jam.get_duration() <= timedelta(seconds=4):
            jam.stop_reason = 'elapsed'
        else:
            for team_jam in jam.team_jams:
                if any(event.lead for event in team_jam.events) and not any(
                    event.lost for event in team_jam.events
                ):
                    jam.stop_reason = 'called'
                    break

    @override
    def start_timeout(self, timestamp: datetime) -> None:
        running_jam: Jam | None = self.get_running_jam()
        if running_jam is not None:
            # Allow the user to end the Jam and immediately start a Timeout
            self.stop_jam(timestamp)
            running_jam = None

        running_timeout: Timeout | None = self.get_running_timeout()
        if running_timeout is not None:
            raise HTTPException(
                HTTPStatus.CONFLICT,
                'A Timeout cannot be called while one is in progress',
            )

        # Instantiate the Timeout
        timeout: Timeout = Timeout(self.get_active_jam(), len(self.timeouts))
        timeout.clock_elapsed = self.clock.get_duration(timestamp)

        logging.info(f'Calling {timeout}')

        timeout.start(timestamp)
        self.timeouts.append(timeout)
        if self.clock.is_running():
            self.clock.stop(timestamp)

    @override
    def stop_timeout(self, timestamp: datetime) -> None:
        timeout: Timeout | None = self.get_running_timeout()
        if timeout is None:
            raise HTTPException(
                HTTPStatus.CONFLICT, 'There is no active Timeout to stop'
            )

        logging.info(f'Ending {timeout}')

        # Validate the Timeout's state
        if timeout.is_review and timeout._team is None:
            raise HTTPException(
                HTTPStatus.CONFLICT, 'Officials cannot call an official review'
            )

        # Stop the Timeout
        timeout.stop(timestamp)

        # Subtract remaining Timeouts or Official Reviews as appropriate
        if timeout._team is not None:
            if timeout.is_review and not timeout.retained:
                timeout._team.reviews_remaining -= 1
            elif not timeout.is_review:
                timeout._team.timeouts_remaining -= 1

    @override
    def add_trip(self, team: Team, timestamp: datetime, passes: int) -> None:
        jam: Jam = self.get_active_jam()
        team_jam: TeamJam = jam.get_team_jam(team)

        logging.info(f'Adding {passes} passes to {team}')

        is_initial: bool = team_jam.get_num_trips() == 0
        is_overtime: bool = jam.period >= self.ruleset.num_periods
        if is_initial:
            logging.info(f'This is the initial pass for {team}')

        event: TripEvent = TripEvent(timestamp, passes=passes)

        # Automatically set lead on the first 4-point trip
        if not jam.lead_is_declared() and passes == self.ruleset.points_per_trip:
            self.add_lead(team, timestamp, True)

        # Lose eligibility on initial no-pass/no-penalty
        if len(team_jam.events) == 0 and passes < self.ruleset.points_per_trip:
            self.add_lost(team, timestamp, True)

        # Jammer cannot earn points on the initial pass
        if is_initial and not is_overtime:
            event.passes = 0

        team_jam.events.append(event)

    @override
    def add_lead(self, team: Team, timestamp: datetime, lead: bool) -> None:
        jam: Jam = self.get_active_jam()
        team_jam: TeamJam = jam.get_team_jam(team)

        logging.info(f'{"Setting" if lead else "Unsetting"} lead for {team}')

        if lead:
            # Add a new Trip Event in which lead is declared
            if jam.lead_is_declared():
                raise HTTPException(
                    HTTPStatus.CONFLICT, 'A lead jammer has already been declared'
                )
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

        logging.info(f'{"Setting" if lost else "Unsetting"} lost for {team}')

        if lost:
            # Add a new Trip Event in which the Jammer has lost eligibility for lead
            if any(event.lost for event in team_jam.events):
                raise HTTPException(
                    HTTPStatus.CONFLICT, 'This team has already lost lead eligibility'
                )
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

        logging.info(f'{"Setting" if star_pass else "Unsetting"} star pass {team}')

        if star_pass:
            if any(event.star_pass for event in team_jam.events):
                raise HTTPException(
                    HTTPStatus.CONFLICT,
                    'This team has already completed a star pass in this Jam',
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

    @override
    def finalize(self) -> None:
        if self.get_running_jam() is not None or self.get_running_timeout() is not None:
            raise HTTPException(
                HTTPStatus.CONFLICT, 'The Bout cannot be finalized now.'
            )

        # Cull all Jams and Timeouts that have not started
        self.jams: list[Jam] = [
            jam for jam in self.jams if jam.start_timestamp is not None
        ]
        self.timeouts: list[Timeout] = [
            timeout for timeout in self.timeouts if timeout.start_timestamp is not None
        ]

        logging.info(f'Finalizing {self}')

        self.is_final = True
