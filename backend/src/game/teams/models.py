"""The Team model and associated business logic."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any, Final, override

from core import CASCADE_CHILD, CASCADE_OTHER, BaseSQLModel
from game.bouts.models import BaseBout
from game.jams.models import BaseJam
from game.team_jams.models import TeamJam
from game.timeouts.models import BaseTimeout
from sqlalchemy import Constraint, ForeignKey, UniqueConstraint, select
from sqlalchemy.orm import (
    Mapped,
    MappedSQLExpression,
    column_property,
    mapped_column,
    relationship,
)
from sqlalchemy.sql import desc

if TYPE_CHECKING:
    from game.rosters.models import Roster


REQUIRED_NUM_TEAMS: Final[int] = 2


class BaseTeam(BaseSQLModel):
    """An abstract Team without any associated ruleset.

    A Team contains team-related information in a given Bout. Example information
    includes the number timeouts and official reviews remaining, as well as more obscure
    data like a team's score offset.
    """

    _roster_id: Mapped[int] = mapped_column(ForeignKey('rosters._id'))
    _bout_id: Mapped[int | None] = mapped_column(
        ForeignKey('bouts._id'), nullable=False
    )

    # TODO: Implement Team colors
    num: Mapped[int] = mapped_column()
    score_offset: Mapped[int] = mapped_column(default=0)
    timeouts_remaining: Mapped[int] = mapped_column()
    reviews_remaining: Mapped[int] = mapped_column()

    _roster: Mapped[Roster] = relationship(
        cascade=CASCADE_OTHER,
        foreign_keys=[_roster_id],
    )
    _bout: Mapped[BaseBout | None] = relationship(
        back_populates='teams',
        cascade=CASCADE_OTHER,
        foreign_keys=[_bout_id],
    )
    team_jams: Mapped[list[TeamJam]] = relationship(
        back_populates='_team',
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

    # Used to calculate the current Jam score
    _active_jam_id: MappedSQLExpression[int | None] = column_property(
        select(BaseJam._id)
        .where(BaseJam.start_timestamp != None)  # noqa: E711
        .order_by(desc(BaseJam.period), desc(BaseJam.num))
        .scalar_subquery()
    )

    _ruleset: MappedSQLExpression[str] = column_property(
        select(BaseBout.ruleset_name).where(BaseBout._id == _bout_id).scalar_subquery()
    )

    __tablename__: str = 'teams'
    __table_args__: tuple[Constraint, ...] = (
        UniqueConstraint('_bout_id', '_roster_id'),
        UniqueConstraint('_bout_id', 'num'),
    )
    __mapper_args__: dict[str, Any] = {
        'polymorphic_abstract': True,
        'polymorphic_on': _ruleset,
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
        raise NotImplementedError('BaseTeam.get_team_jam_score() must be overridden')

    def __init__(self, roster: Roster, team_num: int) -> None:
        """Initialize a Team.

        Args:
            bout (BaseBout): the owning Bout of the Team.
            roster (Roster): the Roster that this Team will use.
            team_num (int): the Team number in the Bout. Each Team in a Bout must have
            a unique team number. A 0 represents the home Team of a Bout.

        """
        super().__init__(_roster=roster, num=team_num)

    @override
    async def get_parents(self) -> tuple[BaseSQLModel, ...]:
        return (await self.get_bout(),)

    async def get_roster(self) -> Roster:
        """Get the Roster to which this Team belongs.

        Returns:
            Roster: the Roster to which this Team belongs.

        """
        return await self.awaitable_attrs._roster

    async def get_bout(self) -> BaseBout:
        """Get the Bout to which this Team belongs.

        Returns:
            BaseBout: the Bout to which this Team belongs.

        """
        return await self.awaitable_attrs._bout

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
        active_team_jam: TeamJam | None = next(
            (tj for tj in self.team_jams if tj._jam_id == self._active_jam_id), None
        )
        if active_team_jam is None:
            return 0
        return self.get_team_jam_score(active_team_jam)
