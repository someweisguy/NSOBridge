"""The Jam model and associated business logic."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Any, override
from uuid import UUID, uuid4

from core.db import CASCADE_CHILD, CASCADE_OTHER, BaseSQLModel, CacheableSQLModel
from game.models import AbstractOneShotModel
from sqlalchemy import (
    CheckConstraint,
    Constraint,
    ForeignKey,
    Index,
    UniqueConstraint,
    column,
    select,
    table,
)
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import (
    Mapped,
    MappedSQLExpression,
    column_property,
    mapped_column,
    relationship,
)

from .types import StopReasonStr  # noqa: TC001 - Make SQLAlchemy happy

if TYPE_CHECKING:
    from datetime import datetime

    from core.app import CacheKey
    from game.bouts.models import BaseBout, Team


class Jam(AbstractOneShotModel, CacheableSQLModel):
    """An abstract Jam without any associated ruleset."""

    _bout_uuid: Mapped[UUID] = mapped_column(ForeignKey('bouts.uuid'))

    period: Mapped[int] = mapped_column()
    num: Mapped[int] = mapped_column()

    _stop_reason: Mapped[StopReasonStr | None] = mapped_column(default=None)

    bout: Mapped[BaseBout] = relationship(
        back_populates='jams',
        cascade=CASCADE_OTHER,
        lazy='selectin',
        foreign_keys=[_bout_uuid],
    )
    team_jams: Mapped[list[TeamJam]] = relationship(
        back_populates='jam',
        cascade=CASCADE_CHILD,
        lazy='selectin',
        order_by='TeamJam.team_num',
    )

    __tablename__: str = 'jams'
    __mapper_args__: dict[str, Any] = {
        'confirm_deleted_rows': False,
    }
    __table_args__: tuple[Constraint | Index, ...] = (
        AbstractOneShotModel.__table_args__
        + (
            UniqueConstraint('_bout_uuid', 'period', 'num'),
            Index('idx_jam_cache_key', '_bout_uuid', 'period', 'num'),
        )
    )

    @classmethod
    def create(cls, period_num: int, jam_num: int, *team_jams: TeamJam) -> Jam:
        """Create a Jam.

        Args:
            period_num (int): the Period number of this Jam, zero-indexed.
            jam_num (int): the Jam number of this Jam, zero-indexed.
            team_jams (tuple[TeamJam, ...]): the TeamJams that will compete in this Jam.

        Returns:
            Jam: the created Jam.

        """
        return Jam(
            uuid=uuid4(), period=period_num, num=jam_num, team_jams=list(team_jams)
        )

    def __str__(self) -> str:
        """Return a str representation of this Jam.

        Returns:
            str: a str representation of this Jam.

        """
        return f'P{self.period + 1}-J{self.num + 1} in {self.bout}'

    @override
    def cache_key(self) -> CacheKey:
        return (self.__tablename__, self._bout_uuid, [self.period, self.num])

    @override
    def get_parents(self) -> tuple[BaseSQLModel, ...]:
        return (self.bout,)

    @property
    def stop_reason(self) -> StopReasonStr | None:
        """Get the reason that the Jam was stopped or None if it is ongoing.

        Returns:
            StopReasonStr | None: The Jam stop reason or None.

        """
        return self._stop_reason

    @stop_reason.setter
    def stop_reason(self, reason: StopReasonStr) -> None:
        if self.is_running():
            raise RuntimeError('Cannot set a stop reason if the Jam is still running')
        self._stop_reason = reason

    @hybrid_property
    def bout_uuid(self) -> UUID:
        """Get the UUID of parent Bout.

        Returns:
            UUID: the UUID of the Bout.

        """
        return self._bout_uuid

    def get_team_jam(self, team: Team | UUID) -> TeamJam:
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
            team = team.uuid

        # Get the first TeamJam that has the specified Team ID
        team_jam: TeamJam | None = next(
            (tj for tj in self.team_jams if tj._team_uuid == team), None
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

    @override
    def stop(self, timestamp: datetime) -> None:
        super().stop(timestamp)
        self.stop_reason = 'other'

    async def add_trip(self, team: Team, timestamp: datetime, passes: int) -> None:
        """Add a Jammer trip to the desired Team's TeamJam.

        Args:
            team (BaseTeam): the desired Team.
            timestamp (datetime): the timestamp at which to add the trip.
            passes (int): the number of passes the Jammer earned.

        """

    async def set_lead(self, team: Team, timestamp: datetime, lead: bool) -> None:
        """Set the lead Jammer status for the desired Team.

        Args:
            team (BaseTeam): the desired Team.
            timestamp (datetime): the timestamp at which to set lead.
            lead (bool): True if the Jammer has been declared lead.

        """

    async def set_lost(self, team: Team, timestamp: datetime, lost: bool) -> None:
        """Set the lead eligibility for the desired Team.

        Args:
            team (BaseTeam): the desired Team.
            timestamp (datetime): the timestamp at which to set lead eligibility.
            lost (bool): True if the Jammer has lost lead eligibility.

        """

    async def set_star_pass(
        self, team: Team, timestamp: datetime, star_pass: bool
    ) -> None:
        """Add a star pass to the desired Team.

        Args:
            team (BaseTeam): the desired Team.
            timestamp (datetime): the timestamp at which to add the star pass.
            star_pass (bool): True if the star has been successfully passed.

        """


class TeamJam(BaseSQLModel):
    """Represent a TeamJam in a Jam.

    A TeamJam is a representation of a specific Team in a given Jam. Since each Jam has
    two Teams competing against each other, each Jam model should have two TeamJam
    models.

    TeamJams can be used to represent jammer trips and the lineup roster for each Team
    in a Jam.

    """

    _jam_uuid: Mapped[UUID] = mapped_column(ForeignKey('jams.uuid'))
    _team_uuid: Mapped[UUID] = mapped_column(ForeignKey('teams.uuid'))

    team: Mapped[Team] = relationship(
        back_populates='team_jams',
        cascade=CASCADE_OTHER,
        lazy='selectin',
        foreign_keys=[_team_uuid],
    )
    jam: Mapped[Jam] = relationship(
        back_populates='team_jams',
        cascade=CASCADE_OTHER,
        foreign_keys=[_jam_uuid],
        lazy='selectin',
    )
    events: Mapped[list[TripEvent]] = relationship(
        back_populates='team_jam',
        cascade=CASCADE_CHILD,
        lazy='selectin',
        order_by=[column('timestamp')],
    )

    jam_num: MappedSQLExpression[int] = column_property(
        select(Jam.num).where(Jam.uuid == _jam_uuid).scalar_subquery()
    )
    period_num: MappedSQLExpression[int] = column_property(
        select(Jam.period).where(Jam.uuid == _jam_uuid).scalar_subquery()
    )
    team_num: MappedSQLExpression[int] = column_property(
        select(table('teams', column('num')))
        .where(column('uuid') == _team_uuid)
        .scalar_subquery()
    )

    __tablename__: str = 'team_jams'
    __mapper_args__: dict[str, Any] = {
        'confirm_deleted_rows': False,  # Make best effort to delete orphaned rows
    }

    @classmethod
    def create(cls, team: Team) -> TeamJam:
        """Initialize a TeamJam.

        Args:
            team (BaseTeam): the Team to which this TeamJam belongs.
            jam (BaseJam): the Jam to which this TeamJam belongs.

        Raises:
            ValueError: if the Team and Jam provided are not in the same Bout.

        """
        return TeamJam(uuid=uuid4(), team=team)

    @override
    def get_parents(self) -> tuple[BaseSQLModel, ...]:
        return (self.team, self.jam)

    def get_team(self) -> Team:
        """Get the Team that owns this TeamJam.

        Returns:
            BaseTeam: the Team that owns this TeamJam.

        """
        return self.team

    def get_num_trips(self) -> int:
        """Get the number of trips that this TeamJam's Jammer has completed.

        Returns:
            int: the number of trips completed.

        """
        return sum([event.passes is not None for event in self.events])


class TripEvent(BaseSQLModel):
    """Represent a TripEvent in a TeamJam.

    A TripEvent represents an event that takes place during a jammer's Trip in a Jam. It
    should be noticed that there is a subtle distinction between a trip and a TripEvent.
    In the WFTDA 2025 ruleset, a trip is when a jammer gains position ahead of the pack.
    A TripEvent is any remarkable event that may occur during a trip, including the
    completion of the trip.

    Events that may occur during a trip include completing a star pass or losing lead
    eligibility.
    """

    _team_jam_uuid: Mapped[UUID | None] = mapped_column(
        ForeignKey('team_jams.uuid'), nullable=False
    )

    timestamp: Mapped[datetime] = mapped_column()
    lead: Mapped[bool] = mapped_column(default=False)
    lost: Mapped[bool] = mapped_column(default=False)
    passes: Mapped[int | None] = mapped_column(default=None)
    star_pass: Mapped[bool] = mapped_column(default=False)

    team_jam: Mapped[TeamJam] = relationship(
        back_populates='events',
        cascade=CASCADE_OTHER,
        lazy='selectin',
        foreign_keys=[_team_jam_uuid],
    )

    __tablename__: str = 'trip_events'
    __table_args__: tuple[Constraint, ...] = (
        CheckConstraint('passes = 0 OR (lead = 0 AND lost = 0 AND star_pass = 0)'),
    )

    def __init__(
        self,
        timestamp: datetime,
        *,
        lead: bool = False,
        lost: bool = False,
        passes: int | None = None,
        star_pass: bool = False,
    ) -> None:
        """Initialize a TripEvent.

        Args:
            timestamp (datetime): the timestamp of the TripEvent.
            lead (bool, optional): True if lead was assessed after this TripEvent.
            Defaults to False.
            lost (bool, optional): True if lead eligibility was lost after this
            TripEvent. Defaults to False.
            passes (int | None, optional): the number of legal passes that were earned
            during this TripEvent. Setting this value to an integer is interpreted as a
            complete trip. If a trip has not been completed, this value should be set to
            None. Defaults to None.
            star_pass (bool, optional): True if a legal star pass was completed after
            this TripEvent. Defaults to False.

        """
        super().__init__(
            team_jam=None,
            uuid=uuid4(),  # Required when adding a new TripEvent
            timestamp=timestamp,
            lead=lead,
            lost=lost,
            passes=passes,
            star_pass=star_pass,
        )

    @override
    def get_parents(self) -> tuple[BaseSQLModel, ...]:
        return (self.team_jam,)

    def is_empty(self) -> bool:
        """Return True if this TripEvent is empty.

        A TripEvent is empty if it does not contain any meaningful data. Typically an
        empty TripEvent should be pruned from the database.

        Returns:
            bool: if the TripEvent is empty.

        """
        return self.passes is None and not any([self.lead, self.lost, self.star_pass])
