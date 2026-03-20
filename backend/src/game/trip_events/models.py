"""The TeamJam model and associated business logic."""

from __future__ import annotations

from datetime import datetime  # noqa: TC003
from typing import TYPE_CHECKING, override
from uuid import UUID  # noqa: TC003

from core import CASCADE_OTHER, BaseSQLModel
from sqlalchemy import CheckConstraint, Constraint, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from game.team_jams.models import TeamJam


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

    team_jam_uuid: Mapped[UUID | None] = mapped_column(
        ForeignKey('team_jams.uuid'), nullable=False
    )

    timestamp: Mapped[datetime] = mapped_column()
    lead: Mapped[bool] = mapped_column(default=False)
    lost: Mapped[bool] = mapped_column(default=False)
    passes: Mapped[int | None] = mapped_column(default=None)
    star_pass: Mapped[bool] = mapped_column(default=False)

    _team_jam: Mapped[TeamJam] = relationship(
        back_populates='events',
        cascade=CASCADE_OTHER,
        lazy='selectin',
        foreign_keys=[team_jam_uuid],
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
            _team_jam=None,
            timestamp=timestamp,
            lead=lead,
            lost=lost,
            passes=passes,
            star_pass=star_pass,
        )

    @override
    def get_parents(self) -> tuple[BaseSQLModel, ...]:
        return (self._team_jam,)

    def get_team_jam(self) -> TeamJam:
        """Get the TeamJam to which this TripEvent belongs.

        Returns:
            TeamJam: the TeamJam to which this TripEvent belongs.

        """
        return self._team_jam

    def is_empty(self) -> bool:
        """Return True if this TripEvent is empty.

        A TripEvent is empty if it does not contain any meaningful data. Typically an
        empty TripEvent should be pruned from the database.

        Returns:
            bool: if the TripEvent is empty.

        """
        return self.passes is None and not any([self.lead, self.lost, self.star_pass])
