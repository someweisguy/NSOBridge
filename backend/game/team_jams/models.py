"""The TeamJam model and associated business logic."""

from __future__ import annotations

from typing import TYPE_CHECKING, override

from core import CHILD_RELATIONSHIP, PARENT_RELATIONSHIP, BaseSQLModel
from game.jams.models import BaseJam
from game.trip_events.models import TripEvent
from sqlalchemy import ForeignKey, select
from sqlalchemy.orm import (
    Mapped,
    MappedSQLExpression,
    column_property,
    mapped_column,
    relationship,
)

if TYPE_CHECKING:
    from game.teams.models import BaseTeam


class TeamJam(BaseSQLModel):
    """Represent a TeamJam in a Jam.

    A TeamJam is a representation of a specific Team in a given Jam. Since each Jam has
    two Teams competing against each other, each Jam model should have two TeamJam
    models.

    TeamJams can be used to represent jammer trips and the lineup roster for each Team
    in a Jam.

    """

    team_id: Mapped[int | None] = mapped_column(ForeignKey('teams.id'))
    jam_id: Mapped[int | None] = mapped_column(ForeignKey('jams.id'))

    jam: Mapped[BaseJam] = relationship(
        back_populates='team_jams',
        cascade=PARENT_RELATIONSHIP,
        foreign_keys=[jam_id],
    )
    team: Mapped[BaseTeam | None] = relationship(
        back_populates='team_jams',
        cascade=PARENT_RELATIONSHIP,
        foreign_keys=[team_id],
    )
    events: Mapped[list[TripEvent]] = relationship(
        back_populates='team_jam',
        cascade=CHILD_RELATIONSHIP,
        lazy='selectin',
        order_by=[TripEvent.timestamp],
    )

    jam_num: MappedSQLExpression[int] = column_property(
        select(BaseJam.num).where(BaseJam.id == jam_id).scalar_subquery()
    )
    period_num: MappedSQLExpression[int] = column_property(
        select(BaseJam.period).where(BaseJam.id == jam_id).scalar_subquery()
    )

    __tablename__: str = 'team_jams'

    def __init__(self, team: BaseTeam, jam: BaseJam) -> None:
        """Initialize a TeamJam.

        Args:
            team (BaseTeam): the Team to which this TeamJam belongs.
            jam (BaseJam): the Jam to which this TeamJam belongs.

        Raises:
            ValueError: if the Team and Jam provided are not in the same Bout.

        """
        if team.bout_id != jam.bout_id:
            raise ValueError('Team and Jam must be from the same Bout')
        super().__init__(team=team, jam=jam)

    @override
    async def get_parents(self) -> tuple[BaseSQLModel, ...]:
        return (await self.awaitable_attrs.team, await self.awaitable_attrs.jam)
