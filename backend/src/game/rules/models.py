"""Ruleset data models."""

from datetime import timedelta
from typing import override
from uuid import UUID

from core.db import CASCADE_OTHER, BaseSQLModel, CacheableSQLModel
from game import BaseBout
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship


class Ruleset(CacheableSQLModel):
    """Ruleset constants in Bouts.

    This primary use of this model is to reduce the amount of magic numbers in the
    codebase.
    """

    _bout_uuid: Mapped[UUID] = mapped_column(ForeignKey('bouts.uuid'))

    """The number of periods in a Bout, not including overtime."""
    num_periods: Mapped[int] = mapped_column(default=2)

    """The duration of a typical Jam in this Bout."""
    jam_duration: Mapped[timedelta] = mapped_column(default=timedelta(minutes=2))

    """The duration of a typical post-Jam lineup."""
    lineup_duration: Mapped[timedelta] = mapped_column(default=timedelta(seconds=30))

    """The maximum number of points which may be earned in a single trip."""
    points_per_trip: Mapped[int] = mapped_column(default=4)

    """The maximum number of timeouts that a team may have."""
    num_timeouts: Mapped[int] = mapped_column(default=3)

    """The maximum number of official reviews which a team may have."""
    num_reviews: Mapped[int] = mapped_column(default=1)

    bout: Mapped[BaseBout] = relationship(
        back_populates='ruleset',
        cascade=CASCADE_OTHER,
        lazy='selectin',
        foreign_keys=[_bout_uuid],
    )

    __tablename__: str = 'rulesets'

    @override
    def get_parents(self) -> tuple[BaseSQLModel, ...]:
        return (self.bout,)
