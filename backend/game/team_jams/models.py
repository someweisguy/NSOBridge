from __future__ import annotations

from typing import TYPE_CHECKING, Any

from game.jams.models import BaseJamModel, TripEventModel
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
    from game.teams.models import BaseTeamModel


class BaseTeamJamModel(BaseSQLModel):
    team_id: Mapped[int | None] = mapped_column(ForeignKey('teams.id'))
    jam_id: Mapped[int | None] = mapped_column(ForeignKey('jams.id'))

    jam: Mapped[BaseJamModel] = relationship(
        back_populates='team_jams',
        cascade=PARENT_RELATIONSHIP,
        lazy='selectin',
    )
    team: Mapped[BaseTeamModel | None] = relationship(
        cascade=PARENT_RELATIONSHIP,
        foreign_keys=[team_id],
        lazy='selectin',
    )
    events: Mapped[list[TripEventModel]] = relationship(
        back_populates='team_jam',
        cascade=CHILD_RELATIONSHIP,
        lazy='selectin',
        order_by=[TripEventModel.timestamp],
    )

    ruleset: MappedSQLExpression[str] = column_property(
        select(BaseJamModel.ruleset)
        .where(BaseJamModel.id == jam_id)
        .limit(1)
        .scalar_subquery()
    )
    jam_num: MappedSQLExpression[int] = column_property(
        select(BaseJamModel.num)
        .where(BaseJamModel.id == jam_id)
        .limit(1)
        .scalar_subquery()
    )
    period_num: MappedSQLExpression[int] = column_property(
        select(BaseJamModel.period)
        .where(BaseJamModel.id == jam_id)
        .limit(1)
        .scalar_subquery()
    )

    __tablename__: str = 'team_jams'
    __mapper_args__: dict[str, Any] = {
        'polymorphic_abstract': True,
        'polymorphic_on': ruleset,
    }

    def __init__(self, team: BaseTeamModel) -> None:
        super().__init__(team=team)
