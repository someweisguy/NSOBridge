"""Types that are used in Bouts."""

from __future__ import annotations

from abc import abstractmethod
from typing import TYPE_CHECKING, ClassVar, Literal

if TYPE_CHECKING:
    from datetime import datetime

    from game.bouts.models import Team
    from game.bouts.schemas import Ruleset


# The various states that a Bout could be.
type BoutStateStr = Literal['final', 'jam', 'lineup', 'stopped', 'timeout']

type BoutSubStateStr = Literal[
    'lineup',
    'post_review',
    'post_timeout',
    'timeout',
    'review',
    'team_timeout',
    'official_timeout',
    'pregame',
    'halftime',
    'unofficial',
    'jam',
    'final',
]


class RulesetProtocol:
    """Handles ruleset events."""

    RULESET_NAME: str

    ruleset: ClassVar[Ruleset]

    @abstractmethod
    def setup(self) -> None:
        """Do Bout initialization.

        Typically handles chores such as setting the correct number of initial timeouts
        and official reviews, etc.

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

    @abstractmethod
    def finalize(self) -> None:
        """Finalize the Bout.

        A finalized Bout has been completed. After a Bout is finalized, there can be no
        more changes made to the Bout.
        """
        ...
