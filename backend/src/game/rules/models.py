"""Ruleset data models."""

from datetime import timedelta

from core.db import CacheableSQLModel
from sqlalchemy.orm import Mapped, mapped_column


class Ruleset(CacheableSQLModel):
    """Ruleset constants in Bouts.

    This primary use of this model is to reduce the amount of magic numbers in the
    codebase.
    """

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

    __tablename__: str = 'rulesets'
