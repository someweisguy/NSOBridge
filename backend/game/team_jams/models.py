from __future__ import annotations

from typing import TYPE_CHECKING, Any

from game.jams.models import BaseJam
from game.trip_events.models import TripEvent
from models import (
    CHILD_RELATIONSHIP,
    PARENT_RELATIONSHIP,
    BaseSQLModel,
)
from sqlalchemy import ForeignKey, select
from sqlalchemy.orm import (
    Mapped,
    MappedSQLExpression,
    column_property,
    mapped_column,
    relationship,
)

if TYPE_CHECKING:
    from datetime import datetime

    from game.teams.models import BaseTeam


class BaseTeamJam(BaseSQLModel):
    team_id: Mapped[int | None] = mapped_column(ForeignKey('teams.id'))
    jam_id: Mapped[int | None] = mapped_column(ForeignKey('jams.id'))

    jam: Mapped[BaseJam] = relationship(
        back_populates='team_jams',
        cascade=PARENT_RELATIONSHIP,
        lazy='selectin',
    )
    team: Mapped[BaseTeam | None] = relationship(
        cascade=PARENT_RELATIONSHIP,
        foreign_keys=[team_id],
        lazy='selectin',
    )
    events: Mapped[list[TripEvent]] = relationship(
        back_populates='team_jam',
        cascade=CHILD_RELATIONSHIP,
        lazy='selectin',
        order_by=[TripEvent.timestamp],
    )

    ruleset: MappedSQLExpression[str] = column_property(
        select(BaseJam.ruleset).where(BaseJam.id == jam_id).limit(1).scalar_subquery()
    )
    jam_num: MappedSQLExpression[int] = column_property(
        select(BaseJam.num).where(BaseJam.id == jam_id).limit(1).scalar_subquery()
    )
    period_num: MappedSQLExpression[int] = column_property(
        select(BaseJam.period).where(BaseJam.id == jam_id).limit(1).scalar_subquery()
    )

    __tablename__: str = 'team_jams'
    __mapper_args__: dict[str, Any] = {
        'polymorphic_abstract': True,
        'polymorphic_on': ruleset,
    }

    def __init__(self, team: BaseTeam) -> None:
        super().__init__(team=team)

    async def add_trip(self, timestamp: datetime, passes: int) -> None: ...

    async def set_lead(self, timestamp: datetime, lead: bool) -> None: ...

    async def set_lost(self, timestamp: datetime, lost: bool) -> None: ...

    async def set_star_pass(self, timestamp: datetime, star_pass: bool) -> None: ...
