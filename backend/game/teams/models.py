from __future__ import annotations

from typing import TYPE_CHECKING, Any, Final

from core.models import (
    CHILD_RELATIONSHIP,
    PARENT_RELATIONSHIP,
    BaseSQLModel,
)
from game.bouts.models import BaseBout
from game.team_jams.models import TeamJam
from game.timeouts.models import BaseTimeout
from sqlalchemy import ForeignKey, select
from sqlalchemy.orm import (
    Mapped,
    MappedSQLExpression,
    column_property,
    mapped_column,
    relationship,
)

if TYPE_CHECKING:
    from game.rosters.models import Roster


REQUIRED_NUM_TEAMS: Final[int] = 2


class BaseTeam(BaseSQLModel):
    bout_id: Mapped[int] = mapped_column(ForeignKey('bouts.id'))
    roster_id: Mapped[int] = mapped_column(ForeignKey('rosters.id'))

    # TODO: Implement Team colors
    score_offset: Mapped[int] = mapped_column(default=0)
    timeouts_remaining: Mapped[int] = mapped_column()
    reviews_remaining: Mapped[int] = mapped_column()

    bout: Mapped[BaseBout] = relationship(
        cascade=PARENT_RELATIONSHIP,
        lazy='selectin',
    )
    roster: Mapped[Roster] = relationship(
        cascade=PARENT_RELATIONSHIP,
        foreign_keys=[roster_id],
        lazy='joined',
    )
    team_jams: Mapped[list[TeamJam]] = relationship(
        back_populates='team',
        cascade=CHILD_RELATIONSHIP,
        lazy='selectin',
        order_by=[TeamJam.period_num, TeamJam.jam_num],
    )
    timeouts: Mapped[list[BaseTimeout]] = relationship(
        back_populates='team',
        cascade=CHILD_RELATIONSHIP,
        lazy='selectin',
        order_by=BaseTimeout.id,
    )

    ruleset: MappedSQLExpression[str] = column_property(
        select(BaseBout.ruleset).where(BaseBout.id == bout_id).scalar_subquery()
    )

    __tablename__: str = 'teams'
    __mapper_args__: dict[str, Any] = {
        'polymorphic_on': ruleset,
    }

    @classmethod
    def get_team_jam_score(cls, team_jam: TeamJam) -> int:
        raise NotImplementedError()

    def __init__(self, roster: Roster) -> None:
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
        active_team_jam: TeamJam = (
            self.team_jams[-1]
            if self.bout.state in ['stopped', 'jam'] or len(self.team_jams) == 1
            else self.team_jams[-2]
        )
        jam_score: int = self.get_team_jam_score(active_team_jam)
        return jam_score
