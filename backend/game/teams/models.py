from __future__ import annotations

from typing import TYPE_CHECKING, Any, Final

from game.jams.models import TeamJamModel
from game.timeouts.models import TimeoutModel
from models import (
    CHILD_RELATIONSHIP,
    PARENT_RELATIONSHIP,
    BaseSQLModel,
)
from sqlalchemy import ForeignKey, select
from sqlalchemy.orm import (
    Mapped,
    column_property,
    mapped_column,
    relationship,
)
from sqlalchemy.orm.properties import MappedSQLExpression  # noqa: TC002
from sqlalchemy.sql._elements_constructors import column, text

if TYPE_CHECKING:
    from game.bouts.models import GenericBoutModel
    from game.rosters.models import RosterModel


REQUIRED_NUM_TEAMS: Final[int] = 2


class BaseTeamModel(BaseSQLModel):
    bout_id: Mapped[int] = mapped_column(ForeignKey('bouts.id'))
    roster_id: Mapped[int] = mapped_column(ForeignKey('rosters.id'))

    score_offset: Mapped[int] = mapped_column(default=0)
    timeouts_remaining: Mapped[int] = mapped_column()
    reviews_remaining: Mapped[int] = mapped_column()

    ruleset: MappedSQLExpression[str] = column_property(
        select(column('bouts.id')).where(text('bouts.id == bout_id')).scalar_subquery()
    )

    bout: Mapped[GenericBoutModel | None] = relationship(
        cascade=PARENT_RELATIONSHIP,
        lazy='selectin',
    )
    roster: Mapped[RosterModel | None] = relationship(
        cascade=PARENT_RELATIONSHIP,
        foreign_keys=[roster_id],
        lazy='joined',
    )
    team_jams: Mapped[list[TeamJamModel]] = relationship(
        back_populates='team',
        cascade=CHILD_RELATIONSHIP,
        lazy='selectin',
        order_by=[TeamJamModel.period_num, TeamJamModel.jam_num],
    )
    timeouts: Mapped[list[TimeoutModel]] = relationship(
        back_populates='team',
        cascade=CHILD_RELATIONSHIP,
        lazy='selectin',
        order_by=TimeoutModel.id,
    )

    __tablename__: str = 'teams'
    __mapper_args__: dict[str, Any] = {
        'polymorphic_on': ruleset,
    }

    @classmethod
    def get_team_jam_score(cls, team_jam: TeamJamModel) -> int:
        raise NotImplementedError()

    def __init__(self, roster: RosterModel) -> None:
        super().__init__(roster=roster)

    @property
    def bout_score(self) -> int:
        bout_score: int = 0
        for team_jam in self.team_jams:
            bout_score += self.get_team_jam_score(team_jam)
        return bout_score

    @property
    def jam_score(self) -> int:
        if len(self.team_jams) == 0:
            return 0
        jam_score: int = self.get_team_jam_score(self.team_jams[-1])
        return jam_score
