"""The Team model and associated business logic."""

from __future__ import annotations

from typing import Final, override
from uuid import UUID  # noqa: TC003

from db import CASCADE_CHILD, CASCADE_OTHER, BaseSQLModel
from game.bouts.models import BaseBout
from game.jams.models import BaseJam
from game.skaters.models import Skater
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

REQUIRED_NUM_TEAMS: Final[int] = 2


class Team(BaseSQLModel):
    """An abstract Team without any associated ruleset.

    A Team contains team-related information in a given Bout. Example information
    includes the number timeouts and official reviews remaining, as well as more obscure
    data like a team's score offset.
    """

    bout_uuid: Mapped[UUID | None] = mapped_column(
        ForeignKey('bouts.uuid'), nullable=False
    )

    num: Mapped[int] = mapped_column()

    name: Mapped[str] = mapped_column()
    league: Mapped[str] = mapped_column(default='')
    mnemonic: Mapped[str] = mapped_column(default='')
    # TODO: Implement Team colors
    score_offset: Mapped[int] = mapped_column(default=0)
    timeouts_remaining: Mapped[int] = mapped_column()
    reviews_remaining: Mapped[int] = mapped_column()

    _bout: Mapped[BaseBout] = relationship(
        back_populates='teams',
        cascade=CASCADE_OTHER,
        lazy='selectin',
        foreign_keys=[bout_uuid],
    )
    skaters: Mapped[list[Skater]] = relationship(
        back_populates='_team',
        cascade=CASCADE_CHILD,
        lazy='selectin',
        order_by=[Skater.num],
    )
    team_jams: Mapped[list[TeamJam]] = relationship(
        back_populates='_team',
        cascade=CASCADE_CHILD,
        lazy='selectin',
        order_by=[TeamJam.period_num, TeamJam.jam_num],
    )
    timeouts: Mapped[list[BaseTimeout]] = relationship(
        back_populates='team',
        cascade='all',  # Exclude `delete-orphan` as Timeouts can be called by officials
        lazy='selectin',
        order_by=[BaseTimeout.num],
    )

    # Used to calculate the current Jam score
    # SQLAlchemy does not understand `is` keyword in WHERE clauses, thus ignore E711.
    _active_jam_uuid: MappedSQLExpression[UUID] = column_property(
        select(BaseJam.uuid)
        .where(BaseJam.start_timestamp != None)  # noqa: E711
        .order_by(desc(BaseJam.period), desc(BaseJam.num))
        .scalar_subquery()
    )
    _ruleset: MappedSQLExpression[str] = column_property(
        select(BaseBout.ruleset_name)
        .where(BaseBout.uuid == bout_uuid)
        .scalar_subquery()
    )

    __tablename__: str = 'teams'
    __table_args__: tuple[Constraint, ...] = (UniqueConstraint('bout_uuid', 'num'),)

    def __init__(self, name: str, team_num: int) -> None:
        """Initialize a Team.

        Args:
            name (str): the name of this Team.
            team_num (int): the Team number in the Bout. Each Team in a Bout must have
            a unique team number. A 0 represents the home Team of a Bout.

        """
        super().__init__(name=name, num=team_num)

    @override
    async def get_parents(self) -> tuple[BaseSQLModel, ...]:
        return (await self.awaitable_attrs._bout,)

    def get_bout(self) -> BaseBout:
        """Get the Bout to which this Team belongs.

        Returns:
            BaseBout: the Bout to which this Team belongs.

        """
        return self._bout

    @property
    def bout_score(self) -> int:
        """Calculate the total bout score of this Team.

        This method may change depending on the ruleset of the owning Bout.

        Returns:
            int: the total bout score of this Team.

        """
        bout_score: int = 0
        for team_jam in self.team_jams:
            bout_score += self._bout.get_team_jam_score(team_jam)
        return bout_score

    @property
    def jam_score(self) -> int:
        """Calculate the current jam score of this Team.

        This method may change depending on the ruleset of the owning Bout.

        Returns:
            int: the current jam score of this Team.

        """
        active_team_jam: TeamJam | None = next(
            (tj for tj in self.team_jams if tj._jam_uuid == self._active_jam_uuid), None
        )
        if active_team_jam is None:
            return 0
        return self._bout.get_team_jam_score(active_team_jam)
