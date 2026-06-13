"""The Team model and associated business logic."""

from __future__ import annotations

from typing import TYPE_CHECKING, Final, override
from uuid import UUID  # noqa: TC003

from db import CASCADE_CHILD, CASCADE_OTHER, BaseSQLModel
from game.skaters.models import Skater
from game.team_jams.models import TeamJam
from game.timeouts.models import Timeout
from sqlalchemy import Constraint, ForeignKey, UniqueConstraint
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

if TYPE_CHECKING:
    from game.bouts.models import BaseBout

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

    num: Mapped[int] = mapped_column(default=0)

    name: Mapped[str] = mapped_column()
    league: Mapped[str] = mapped_column(default='')
    mnemonic: Mapped[str] = mapped_column(default='')
    # TODO: Implement Team colors
    score_offset: Mapped[int] = mapped_column(default=0)
    timeouts_remaining: Mapped[int] = mapped_column(default=0)
    reviews_remaining: Mapped[int] = mapped_column(default=0)

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
    timeouts: Mapped[list[Timeout]] = relationship(
        back_populates='team',
        cascade='all',  # Exclude `delete-orphan` as Timeouts can be called by officials
        lazy='selectin',
        order_by=[Timeout.num],
    )

    __tablename__: str = 'teams'
    __table_args__: tuple[Constraint, ...] = (UniqueConstraint('bout_uuid', 'num'),)

    def __init__(self, name: str) -> None:
        """Initialize a Team.

        Args:
            name (str): the name of this Team.

        """
        super().__init__(name=name)

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
        for team_jam in reversed(self.team_jams):
            if team_jam.jam.is_started():
                break
        return self._bout.get_team_jam_score(team_jam)
