"""# TODO: Summary goes here."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import TYPE_CHECKING

from .query import RuleQuerier

if TYPE_CHECKING:
    from datetime import datetime

    from game.teams.models import Team


class RuleMutator(RuleQuerier, ABC):
    """Handles ruleset events."""

    @abstractmethod
    def init_bout(self) -> None:
        """Do Bout initialization.

        Args:
            bout (Bout): the Bout to initialize.

        """
        ...

    @abstractmethod
    def begin_period(self, timestamp: datetime) -> None:
        """Begin the next Period.

        Args:
            timestamp (datetime): the timestamp at which to begin the Period.

        """
        ...

    @abstractmethod
    def end_period(self, timestamp: datetime) -> None:
        """End the current Period.

        Args:
            timestamp (datetime): the timestamp at which to end the Period.

        """
        ...

    @abstractmethod
    def start_jam(self, timestamp: datetime) -> None:
        """Start the next Jam.

        Args:
            timestamp (datetime): the timestamp at which to start the Jam.

        Returns:
            BaseJam: the Jam that was started.

        """
        ...

    @abstractmethod
    def stop_jam(self, timestamp: datetime) -> None:
        """Stop the current Jam.

        Args:
            timestamp (datetime): the timestamp at which to stop the Jam.

        Returns:
            BaseJam: the Jam that was stopped.

        """
        ...

    @abstractmethod
    def start_timeout(self, timestamp: datetime) -> None:
        """Call a Timeout.

        Args:
            timestamp (datetime): the timestamp at which to call the Timeout.

        Returns:
            BaseTimeout: the Timeout that was called.

        """
        ...

    @abstractmethod
    def stop_timeout(self, timestamp: datetime) -> None:
        """Stop the current Timeout.

        Args:
            timestamp (datetime): the timestamp at which to stop the Timeout.

        Returns:
            BaseTimeout: the Timeout that was stopped.

        """
        ...

    @abstractmethod
    def add_trip(self, team: Team, timestamp: datetime, passes: int) -> None:
        """Add a Jammer trip to the desired Team's latest or active TeamJam.

        Args:
            team (BaseTeam): the desired Team.
            timestamp (datetime): the timestamp at which to add the trip.
            passes (int): the number of passes the Jammer earned.

        """
        ...

    @abstractmethod
    def add_lead(self, team: Team, timestamp: datetime, lead: bool) -> None:
        """Set the lead Jammer status for the desired Team.

        Args:
            team (BaseTeam): the desired Team.
            timestamp (datetime): the timestamp at which to set lead.
            lead (bool): True if the Jammer has been declared lead.

        """
        ...

    @abstractmethod
    def add_lost(self, team: Team, timestamp: datetime, lost: bool) -> None:
        """Set the lead eligibility for the desired Team.

        Args:
            team (BaseTeam): the desired Team.
            timestamp (datetime): the timestamp at which to set lead eligibility.
            lost (bool): True if the Jammer has lost lead eligibility.

        """
        ...

    @abstractmethod
    def add_star_pass(self, team: Team, timestamp: datetime, star_pass: bool) -> None:
        """Add a star pass to the desired Team.

        Args:
            team (BaseTeam): the desired Team.
            timestamp (datetime): the timestamp at which to add the star pass.
            star_pass (bool): True if the star has been successfully passed.

        """
        ...
