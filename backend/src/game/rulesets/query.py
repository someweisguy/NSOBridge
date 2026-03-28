"""# TODO Summary goes here."""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from game.bouts.models import BaseBout
    from game.jams.models import BaseJam
    from game.team_jams.models import TeamJam
    from game.timeouts.models import BaseTimeout


class RuleQuerier:
    """Defines how a Ruleset gets various objects in a Bout."""

    def __init__(self, bout: BaseBout) -> None:
        """Create a RuleMutator which is associated with the desired Bout.

        Args:
            bout (Bout): the Bout with which to associate this RuleMutator.

        """
        self._bout = bout

    @property
    def bout(self) -> BaseBout:
        """The Bout associated with this RuleMutator.

        Returns:
            Bout: the associated Bout.

        """
        return self._bout

    def get_active_jam(self) -> BaseJam:
        """Get the most recently started Jam or upcoming Jam.

        Returns:
            BaseJam: the active Jam.

        """
        return next((j for j in self.bout.jams if j.is_started()), self.bout.jams[-1])

    def get_running_jam(self) -> BaseJam | None:
        """Get the running Jam if there is one.

        Returns:
            BaseJam | None: the running Jam or None.

        """
        return next((j for j in self.bout.jams if j.is_running()), None)

    def get_upcoming_jam(self) -> BaseJam | None:
        """Get the upcoming Jam if there is one.

        The upcoming Jam is the first Jam that is not started.

        Returns:
            BaseJam | None: the upcoming Jam or None.

        """
        return next((j for j in self.bout.jams if not j.is_started()), None)

    def get_running_timeout(self) -> BaseTimeout | None:
        """Get the running Timeout if there is one.

        Returns:
            BaseTimeout | None: the running Timeout or None.

        """
        return next((t for t in self.bout.timeouts if t.is_running()), None)

    def get_last_timeout(self) -> BaseTimeout | None:
        """Get most recently complete Timeout if there is one.

        Returns:
            BaseTimeout | None: the most recently complete Timeout or None.

        """
        return next(
            (t for t in reversed(self.bout.timeouts) if not t.is_running()), None
        )

    def get_team_jam_score(self, team_jam: TeamJam) -> int:
        """Calculate the score in the desired TeamJam.

        This method may change depending on the ruleset of the owning Bout.

        Args:
            team_jam (TeamJam): the TeamJam with which to calculate the score.

        Returns:
            int: the calculated score of the TeamJam.

        """
        jam_score: int = 0
        for event in team_jam.events:
            if event.passes is not None:
                jam_score += event.passes
        return jam_score
