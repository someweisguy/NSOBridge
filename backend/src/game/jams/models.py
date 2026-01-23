"""The Jam model and associated business logic."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any, Literal, override
from uuid import UUID

from core import CASCADE_CHILD, CASCADE_OTHER, BaseSQLModel
from game.bouts.models import BaseBout
from game.models import AbstractOneShotModel, CacheableSQLModel, CacheKey
from sqlalchemy import Constraint, ForeignKey, UniqueConstraint, select
from sqlalchemy.orm import (
    Mapped,
    MappedSQLExpression,
    column_property,
    mapped_column,
    relationship,
)

if TYPE_CHECKING:
    from datetime import datetime

    from game.team_jams.models import TeamJam
    from game.teams.models import BaseTeam


type StopReasonStr = Literal['called', 'elapsed', 'injury', 'other']


class BaseJam(AbstractOneShotModel, CacheableSQLModel):
    """An abstract Jam without any associated ruleset."""

    bout_uuid: Mapped[UUID | None] = mapped_column(
        ForeignKey('bouts.uuid'), nullable=False
    )

    num: Mapped[int] = mapped_column(index=True)
    period: Mapped[int] = mapped_column(index=True)
    stop_reason: Mapped[StopReasonStr | None] = mapped_column(default=None)

    _bout: Mapped[BaseBout | None] = relationship(
        back_populates='jams',
        cascade=CASCADE_OTHER,
        foreign_keys=[bout_uuid],
    )
    team_jams: Mapped[list[TeamJam]] = relationship(
        back_populates='_jam',
        cascade=CASCADE_CHILD,
        lazy='selectin',
    )

    _ruleset: MappedSQLExpression[str] = column_property(
        select(BaseBout.ruleset_name)
        .where(BaseBout.uuid == bout_uuid)
        .scalar_subquery()
    )

    __tablename__: str = 'jams'
    __mapper_args__: dict[str, Any] = {
        'polymorphic_abstract': True,
        'polymorphic_on': _ruleset,
        'confirm_deleted_rows': False,
    }
    __table_args__: tuple[Constraint, ...] = AbstractOneShotModel.__table_args__ + (
        UniqueConstraint('bout_uuid', 'num', 'period'),
    )

    def __str__(self) -> str:
        """Return a str representation of this Jam.

        Returns:
            str: a str representation of this Jam.

        """
        return f'[Bout ID: {self.bout_uuid}, P{self.period} J{self.num}]'

    def __init__(self, period_num: int, jam_num: int, *team_jams: TeamJam) -> None:
        """Initialize a Jam.

        Args:
            period_num (int): the Period number of this Jam, zero-indexed.
            jam_num (int): the Jam number of this Jam, zero-indexed.
            team_jams (tuple[TeamJam, ...]): the TeamJams that will compete in this Jam.

        """
        super().__init__(period=period_num, num=jam_num, team_jams=list(team_jams))

    @override
    async def cache_key(self) -> CacheKey:
        return (self.__tablename__, self.bout_uuid, self.period, self.num)

    @override
    async def get_parents(self) -> tuple[BaseSQLModel, ...]:
        return (await self.get_bout(),)

    async def get_bout(self) -> BaseBout:
        """Get the Bout that owns this Jam.

        Returns:
            BaseBout: the Bout that owns this Jam.

        """
        return await self.awaitable_attrs._bout

    def get_team_jam(self, team: BaseTeam | UUID) -> TeamJam:
        """Get the TeamJam associated with the desired Team.

        Args:
            team (BaseTeam | UUID): the Team or Team UUID of the desired TeamJam.

        Raises:
            KeyError: the specified Team is not persistent in the database.
            ValueError: the specified Team is not in this Jam.

        Returns:
            TeamJam: the TeamJam associated with the desired Team.

        """
        if not isinstance(team, UUID):
            if team.uuid is None:
                raise KeyError('this team does not exist')
            team = team.uuid

        # Get the first TeamJam that has the specified Team ID
        team_jam: TeamJam | None = next(
            (tj for tj in self.team_jams if tj.team_uuid == team), None
        )

        if team_jam is None:
            raise ValueError('the specified team is not in this Jam')

        return team_jam

    def lead_is_declared(self) -> bool:
        """Return True if the lead Jammer has been declared.

        Returns:
            bool: True if lead is declared.

        """
        for team_jam in self.team_jams:
            if any(event.lead for event in team_jam.events):
                return True
        return False

    async def add_trip(self, team: BaseTeam, timestamp: datetime, passes: int) -> None:
        """Add a Jammer trip to the desired Team's TeamJam.

        Args:
            team (BaseTeam): the desired Team.
            timestamp (datetime): the timestamp at which to add the trip.
            passes (int): the number of passes the Jammer earned.

        """
        ...

    async def set_lead(self, team: BaseTeam, timestamp: datetime, lead: bool) -> None:
        """Set the lead Jammer status for the desired Team.

        Args:
            team (BaseTeam): the desired Team.
            timestamp (datetime): the timestamp at which to set lead.
            lead (bool): True if the Jammer has been declared lead.

        """
        ...

    async def set_lost(self, team: BaseTeam, timestamp: datetime, lost: bool) -> None:
        """Set the lead eligibility for the desired Team.

        Args:
            team (BaseTeam): the desired Team.
            timestamp (datetime): the timestamp at which to set lead eligibility.
            lost (bool): True if the Jammer has lost lead eligibility.

        """
        ...

    async def set_star_pass(
        self, team: BaseTeam, timestamp: datetime, star_pass: bool
    ) -> None:
        """Add a star pass to the desired Team.

        Args:
            team (BaseTeam): the desired Team.
            timestamp (datetime): the timestamp at which to add the star pass.
            star_pass (bool): True if the star has been successfully passed.

        """
        ...
