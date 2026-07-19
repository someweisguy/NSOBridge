"""The Timeout model and associated business logic."""

from __future__ import annotations

from datetime import timedelta  # noqa: TC003
from typing import TYPE_CHECKING, override
from uuid import UUID  # noqa: TC003

from core.db import CASCADE_OTHER, BaseSQLModel, CacheableSQLModel
from game.models import AbstractOneShotModel
from sqlalchemy import ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql.schema import Constraint, UniqueConstraint

if TYPE_CHECKING:
    from core.app import CacheKey
    from game.bouts.models import BaseBout, Team
    from game.jams.models import Jam


class Timeout(AbstractOneShotModel, CacheableSQLModel):
    """A Timeout without any associated ruleset.

    Timeouts models can represent either a timeout or an official review.
    """

    _jam_uuid: Mapped[UUID] = mapped_column(ForeignKey('jams.uuid'))
    _team_uuid: Mapped[UUID | None] = mapped_column(ForeignKey('teams.uuid'))
    _bout_uuid: Mapped[UUID | None] = mapped_column(
        ForeignKey('bouts.uuid'), nullable=False
    )

    num: Mapped[int] = mapped_column()

    _team_is_officials: Mapped[bool] = mapped_column(default=False)
    clock_elapsed: Mapped[timedelta | None] = mapped_column(default=None)
    is_review: Mapped[bool] = mapped_column(default=False)
    details: Mapped[str] = mapped_column(default='')
    result: Mapped[str] = mapped_column(default='')
    retained: Mapped[bool] = mapped_column(default=False)

    _team: Mapped[Team | None] = relationship(
        back_populates='timeouts',
        cascade=CASCADE_OTHER,
        foreign_keys=[_team_uuid],
        lazy='selectin',
    )
    bout: Mapped[BaseBout] = relationship(
        back_populates='timeouts',
        cascade=CASCADE_OTHER,
        lazy='selectin',
        foreign_keys=[_bout_uuid],
    )
    jam: Mapped[Jam] = relationship(
        cascade=CASCADE_OTHER,
        foreign_keys=[_jam_uuid],
        lazy='selectin',
    )

    __tablename__: str = 'timeouts'
    __table_args__: tuple[Constraint | Index, ...] = (
        UniqueConstraint('_bout_uuid', 'num'),
        Index('idx_timeout_cache_key', '_bout_uuid', 'num'),
    )

    def __str__(self) -> str:
        """Return a str representation of this Timeout.

        Returns:
            str: a str representation of this Timeout.

        """
        return f'timeout {self.num + 1} in {self.bout}'

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
        return (self.__tablename__, self._bout_uuid, self.num)

    @override
    def get_parents(self) -> tuple[BaseSQLModel, ...]:
        if self._team_uuid is None:
            return (self.bout,)
        return (self.bout, self._team)  # ty:ignore[invalid-return-type]

    @property
    def team(self) -> Team | None:
        """Get the Team that called this Timeout or None.

        None is returned if the Timeout has not yet been assigned to a Team or if the
        Officials called this timeout.

        Returns:
            Team | None: the calling Team or None.

        """
        return self._team

    @team.setter
    def team(self, team: Team | int | None) -> None:
        """Set the calling Team of this Timeout.

        When a Timeout is initialized, it is not clear if the timeout is called by a
        Team or by the officials. Calling this method sets the model data such that it
        is clear who called the Timeout.

        Args:
            team (Team | int | None): the calling Team of this Timeout, the calling team
            number or None if this Timeout was called by the officials.

        """
        if isinstance(team, int):
            team = self.bout.teams[team]
        self._team = team
        self._team_is_officials = team is None

    @property
    def team_is_officials(self) -> bool:
        """True if this team has been called by the officials.

        Knowing the calling Team of a Timeout is a tri-state logic. A Timeout can be
        called by a team, by the officials, or it could be unknown who the caller is. If
        this property is False and `self.team` is None, then it is not yet known who
        called this Timeout.

        Returns:
            bool: True if this team was called by the officials.

        """
        return self._team_is_officials
