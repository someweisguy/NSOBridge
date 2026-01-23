"""The TeamJam model and associated business logic."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any, override
from uuid import UUID  # noqa: TC003

from core import CASCADE_CHILD, CASCADE_OTHER, BaseSQLModel
from game.jams.models import BaseJam
from game.trip_events.models import TripEvent
from sqlalchemy import ForeignKey, column, select, table
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

    _jam_uuid: Mapped[UUID | None] = mapped_column(
        ForeignKey('jams.uuid'), nullable=False
    )
    team_uuid: Mapped[UUID] = mapped_column(ForeignKey('teams.uuid'))

    _team: Mapped[BaseTeam | None] = relationship(
        back_populates='team_jams',
        cascade=CASCADE_OTHER,
        foreign_keys=[team_uuid],
    )
    _jam: Mapped[BaseJam] = relationship(
        back_populates='team_jams',
        cascade=CASCADE_OTHER,
        foreign_keys=[_jam_uuid],
        lazy='selectin',
    )
    events: Mapped[list[TripEvent]] = relationship(
        back_populates='_team_jam',
        cascade=CASCADE_CHILD,
        lazy='selectin',
        order_by=[TripEvent.timestamp],
    )

    jam_num: MappedSQLExpression[int] = column_property(
        select(BaseJam.num).where(BaseJam.uuid == _jam_uuid).scalar_subquery()
    )
    period_num: MappedSQLExpression[int] = column_property(
        select(BaseJam.period).where(BaseJam.uuid == _jam_uuid).scalar_subquery()
    )
    team_num: MappedSQLExpression[int] = column_property(
        select(table('teams', column('num')))
        .where(column('uuid') == team_uuid)
        .scalar_subquery()
    )

    __tablename__: str = 'team_jams'
    __mapper_args__: dict[str, Any] = {
        'confirm_deleted_rows': False,  # Make best effort to delete orphaned rows
    }

    def __init__(self, team: BaseTeam) -> None:
        """Initialize a TeamJam.

        Args:
            team (BaseTeam): the Team to which this TeamJam belongs.
            jam (BaseJam): the Jam to which this TeamJam belongs.

        Raises:
            ValueError: if the Team and Jam provided are not in the same Bout.

        """
        super().__init__(_team=team)

    @override
    async def get_parents(self) -> tuple[BaseSQLModel, ...]:
        return (await self.get_team(), await self.get_jam())

    async def get_team(self) -> BaseTeam:
        """Get the Team that owns this TeamJam.

        Returns:
            BaseTeam: the Team that owns this TeamJam.

        """
        return await self.awaitable_attrs._team

    async def get_jam(self) -> BaseJam:
        """Get the Jam that owns this TeamJam.

        Returns:
            BaseJam: the Jam that owns this TeamJam.

        """
        return await self.awaitable_attrs._jam
