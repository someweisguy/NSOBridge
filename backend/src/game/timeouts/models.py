"""The Timeout model and associated business logic."""

from __future__ import annotations

from datetime import timedelta  # noqa: TC003
from typing import TYPE_CHECKING, override
from uuid import UUID  # noqa: TC003

from core.db import CASCADE_OTHER, BaseSQLModel, CacheableSQLModel
from game.bouts.models import BaseBout
from game.models import AbstractOneShotModel
from sqlalchemy import ForeignKey, select
from sqlalchemy.orm import (
    Mapped,
    MappedSQLExpression,
    column_property,
    mapped_column,
    relationship,
)
from sqlalchemy.sql.schema import Constraint, UniqueConstraint

from .schemas import TimeoutSchema

if TYPE_CHECKING:
    from core.db import CacheKey
    from game.jams.models import Jam
    from game.teams.models import Team


class Timeout(AbstractOneShotModel, CacheableSQLModel):
    """A Timeout without any associated ruleset.

    Timeouts models can represent either a timeout or an official review.
    """

    _jam_uuid: Mapped[UUID] = mapped_column(ForeignKey('jams.uuid'))
    _team_uuid: Mapped[UUID | None] = mapped_column(ForeignKey('teams.uuid'))
    bout_uuid: Mapped[UUID | None] = mapped_column(
        ForeignKey('bouts.uuid'), nullable=False
    )

    num: Mapped[int] = mapped_column()

    clock_elapsed: Mapped[timedelta | None] = mapped_column(default=None)
    team_is_officials: Mapped[bool] = mapped_column(default=False)
    is_review: Mapped[bool] = mapped_column(default=False)
    details: Mapped[str] = mapped_column(default='')
    result: Mapped[str] = mapped_column(default='')
    retained: Mapped[bool] = mapped_column(default=False)

    _bout: Mapped[BaseBout] = relationship(
        back_populates='timeouts',
        cascade=CASCADE_OTHER,
        lazy='selectin',
        foreign_keys=[bout_uuid],
    )
    jam: Mapped[Jam] = relationship(
        cascade=CASCADE_OTHER,
        foreign_keys=[_jam_uuid],
        lazy='selectin',
    )
    team: Mapped[Team | None] = relationship(
        back_populates='timeouts',
        cascade=CASCADE_OTHER,
        foreign_keys=[_team_uuid],
        lazy='selectin',
    )

    _ruleset: MappedSQLExpression[str] = column_property(
        select(BaseBout.ruleset_name)
        .where(BaseBout.uuid == bout_uuid)
        .scalar_subquery()
    )

    __tablename__: str = 'timeouts'
    __table_args__: tuple[Constraint, ...] = (UniqueConstraint('bout_uuid', 'num'),)

    def __str__(self) -> str:
        """Return a str representation of this Timeout.

        Returns:
            str: a str representation of this Timeout.

        """
        return f'[Bout ID: {self.bout_uuid}, T{self.num}]'

    def __init__(self, jam: Jam, num: int) -> None:
        """Initialize a Timeout.

        The default state for a Timeout is a regular timeout (not an official review)
        with an unknown caller (called by neither a Team nor by the officials).

        Args:
            jam (BaseJam): the Jam preceding this Timeout
            num (int): the unique Timeout number associated with this Bout.

        """
        super().__init__(jam=jam, num=num)

    @override
    def cache_key(self) -> CacheKey:
        return (self.__tablename__, self.bout_uuid, self.num)

    @override
    def serialize(self) -> TimeoutSchema:
        return TimeoutSchema.model_validate(self)

    @override
    def get_parents(self) -> tuple[BaseSQLModel, ...]:
        if self._team_uuid is None:
            return (self._bout,)
        return (self._bout, self.team)  # ty:ignore[invalid-return-type]

    def get_bout(self) -> BaseBout:
        """Get the Bout that owns this Timeout.

        Returns:
            BaseBout: the Bout that Owns this Timeout.

        """
        return self._bout

    def set_team(self, team: Team | None) -> None:
        """Set the calling Team of this Timeout.

        When a Timeout is initialized, it is not clear if the timeout is called by a
        Team or by the officials. Calling this method sets the model data such that it
        is clear who called the Timeout.

        Args:
            team (BaseTeam | None): the calling Team of this Timeout or None if this
            Timeout was called by the officials.

        """
        self._team_uuid = team.uuid if team is not None else None
        self.team_is_officials = team is None
