"""The Team model and associated business logic."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any, Final, override

from core import CASCADE_CHILD, CASCADE_OTHER, BaseSQLModel
from game.bouts.models import BaseBout
from game.team_jams.models import TeamJam
from game.timeouts.models import BaseTimeout
from sqlalchemy import ForeignKey, select
from sqlalchemy.orm import (
    Mapped,
    MappedSQLExpression,
    column_property,
    mapped_column,
    relationship,
)

if TYPE_CHECKING:
    from game.rosters.models import Roster


REQUIRED_NUM_TEAMS: Final[int] = 2


class BaseTeam(BaseSQLModel):
    """An abstract Team without any associated ruleset.

    A Team contains team-related information in a given Bout. Example information
    includes the number timeouts and official reviews remaining, as well as more obscure
    data like a team's score offset.
    """

    roster_id: Mapped[int] = mapped_column(ForeignKey('rosters.id'))
    bout_id: Mapped[int] = mapped_column(ForeignKey('bouts.id'))

    # TODO: Implement Team colors
    score_offset: Mapped[int] = mapped_column(default=0)
    timeouts_remaining: Mapped[int] = mapped_column()
    reviews_remaining: Mapped[int] = mapped_column()

    roster: Mapped[Roster] = relationship(
        cascade=CASCADE_OTHER,
        foreign_keys=[roster_id],
    )
    bout: Mapped[BaseBout] = relationship(
        back_populates='teams',
        cascade=CASCADE_OTHER,
        foreign_keys=[bout_id],
    )
    team_jams: Mapped[list[TeamJam]] = relationship(
        back_populates='team',
        cascade=CASCADE_CHILD,
        lazy='selectin',
        order_by=[TeamJam.period_num, TeamJam.jam_num],
    )
    timeouts: Mapped[list[BaseTimeout]] = relationship(
        back_populates='team',
        cascade=CASCADE_CHILD,
        lazy='selectin',
        order_by=[BaseTimeout.num],
    )

    ruleset: MappedSQLExpression[str] = column_property(
        select(BaseBout.ruleset_name).where(BaseBout.id == bout_id).scalar_subquery()
    )

    __tablename__: str = 'teams'
    __mapper_args__: dict[str, Any] = {
        'polymorphic_on': ruleset,
    }

    @classmethod
    def get_team_jam_score(cls, team_jam: TeamJam) -> int:
        """Calculate the score in the desired TeamJam.

        This method may change depending on the ruleset of the owning Bout.

        Args:
            team_jam (TeamJam): the TeamJam with which to calculate the score.

        Returns:
            int: the calculated score of the TeamJam.

        """
        raise NotImplementedError()

    def __init__(self, bout: BaseBout, roster: Roster) -> None:
        """Initialize a Team.

        Args:
            bout (BaseBout): the owning Bout of the Team.
            roster (Roster): the Roster that this Team will use.

        """
        super().__init__(bout=bout, bout_id=bout.id, roster=roster)

    @override
    async def get_parents(self) -> tuple[BaseSQLModel, ...]:
        return (await self.awaitable_attrs.bout,)

    @property
    def bout_score(self) -> int:
        """Calculate the total bout score of this Team.

        This method may change depending on the ruleset of the owning Bout.

        Returns:
            int: the total bout score of this Team.

        """
        bout_score: int = 0
        for team_jam in self.team_jams:
            bout_score += self.get_team_jam_score(team_jam)
        return bout_score

    @property
    def jam_score(self) -> int:
        """Calculate the current jam score of this Team.

        This method may change depending on the ruleset of the owning Bout.

        Returns:
            int: the current jam score of this Team.

        """
        return 0

        # FIXME
        # if len(self.team_jams) == 0:
        #     return 0
        # active_team_jam: TeamJam = (
        #     self.team_jams[-1]
        #     if self.bout.state in ['stopped', 'jam'] or len(self.team_jams) == 1
        #     else self.team_jams[-2]
        # )
        # jam_score: int = self.get_team_jam_score(active_team_jam)
        # return jam_score
