"""The Timeout model and associated business logic."""

from __future__ import annotations

from datetime import timedelta  # noqa: TC003
from typing import TYPE_CHECKING, Any, override

from core import CASCADE_OTHER, BaseSQLModel
from game.bouts.models import BaseBout
from game.models import AbstractOneShotModel, CacheableSQLModel, CacheKey
from sqlalchemy import ForeignKey, select
from sqlalchemy.orm import (
    Mapped,
    MappedSQLExpression,
    column_property,
    mapped_column,
    relationship,
)
from sqlalchemy.sql.schema import Constraint, UniqueConstraint

if TYPE_CHECKING:
    from game.jams.models import BaseJam
    from game.teams.models import BaseTeam


class BaseTimeout(AbstractOneShotModel, CacheableSQLModel):
    """An abstract Timeout without any associated ruleset.

    Timeouts models can represent either a timeout or an official review.
    """

    _bout_id: Mapped[int] = mapped_column(ForeignKey('bouts._id'))
    _team_id: Mapped[int | None] = mapped_column(ForeignKey('teams._id'))
    _jam_id: Mapped[int | None] = mapped_column(ForeignKey('jams._id'))

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
        foreign_keys=[_bout_id],
    )

    # The next two relationships are special cases - they can be eagerly loaded
    team: Mapped[BaseTeam | None] = relationship(
        back_populates='timeouts',
        cascade=CASCADE_OTHER,
        foreign_keys=[_team_id],
        lazy='selectin',
    )
    jam: Mapped[BaseJam | None] = relationship(
        cascade=CASCADE_OTHER, foreign_keys=[_jam_id], lazy='selectin'
    )

    ruleset: MappedSQLExpression[str] = column_property(
        select(BaseBout.ruleset_name).where(BaseBout._id == _bout_id).scalar_subquery()
    )

    __tablename__: str = 'timeouts'
    __mapper_args__: dict[str, Any] = {
        'polymorphic_abstract': True,
        'polymorphic_on': ruleset,
    }
    __table_args__: tuple[Constraint, ...] = (UniqueConstraint('_bout_id', 'num'),)

    def __str__(self) -> str:
        """Return a str representation of this Timeout.

        Returns:
            str: a str representation of this Timeout.

        """
        return f'[Bout ID: {self._bout_id}, T{self.num}]'

    def __init__(self, bout: BaseBout, num: int) -> None:
        """Initialize a Timeout.

        The default state for a Timeout is a regular timeout (not an official review)
        with an unknown caller (called by neither a Team nor by the officials).

        Args:
            bout (BaseBout): the Bout that owns this Timeout.
            num (int): the unique Timeout number associated with this Bout.

        """
        super().__init__(_bout=bout, num=num)

    @override
    async def cache_key(self) -> CacheKey:
        return (self.__tablename__, self._bout_id, self._id)

    @override
    async def get_parents(self) -> tuple[BaseSQLModel, ...]:
        if self.team is None:
            return (await self.get_bout(),)
        return (await self.get_bout(), self.team)

    async def get_bout(self) -> BaseBout:
        """Get the Bout that owns this Timeout.

        Returns:
            BaseBout: the Bout that Owns this Timeout.

        """
        return await self.awaitable_attrs._bout

    def set_type(self, is_review: bool) -> None:
        """Set whether this Timeout is a timeout or an official review.

        Args:
            is_review (bool): True if this Timeout is an official review.

        """
        ...

    def set_team(self, team: BaseTeam | None) -> None:
        """Set the calling Team of this Timeout.

        Args:
            team (BaseTeam | None): the calling Team of this Timeout or None if this
            Timeout was called by the officials.

        """
        ...

    def set_retained(self, retained: bool) -> None:
        """Set whether or not this Timeout was retained.

        A retained Timeout is not subtracted from a Team's remaining timeouts or
        official reviews when it is completed.

        Args:
            retained (bool): True if this timeout should be retained.

        """
        ...
