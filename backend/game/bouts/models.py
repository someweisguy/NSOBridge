from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime  # noqa: TC003
from functools import cached_property
from typing import TYPE_CHECKING, Any, Final, Literal, final

from game.clocks.models import ClockModel, TimeoutModel
from game.jams.models import JamModel, TeamJamModel
from models import (
    CHILD_RELATIONSHIP,
    PARENT_RELATIONSHIP,
    BaseSQLModel,
    CacheableSQLModel,
)
from sqlalchemy import ForeignKey, select
from sqlalchemy.orm import (
    Mapped,
    column_property,
    mapped_column,
    relationship,
)
from sqlalchemy.orm.properties import MappedSQLExpression  # noqa: TC002

if TYPE_CHECKING:
    from datetime import timedelta

    from rosters.models import RosterModel
    from series.models import SeriesModel


REQUIRED_NUM_TEAMS: Final[int] = 2


@dataclass(frozen=True)
class BoutContext:
    jam_duration: timedelta
    lineup_duration: timedelta
    points_per_trip: int
    num_timeouts: int
    num_reviews: int


class GenericBoutModel(CacheableSQLModel):
    series_id: Mapped[int] = mapped_column(ForeignKey('series.id'))
    clock_id: Mapped[int] = mapped_column(ForeignKey('clocks.id', ondelete='RESTRICT'))

    expected_start_timestamp: Mapped[datetime | None] = mapped_column(default=None)
    is_final: Mapped[bool] = mapped_column(default=False)
    is_running: Mapped[bool] = mapped_column(default=False)
    ruleset: Mapped[str] = mapped_column()

    clock: Mapped[ClockModel] = relationship(
        cascade=CHILD_RELATIONSHIP,
        foreign_keys=[clock_id],
        lazy='joined',
        single_parent=True,
    )
    jams: Mapped[list[JamModel]] = relationship(
        back_populates='bout',
        cascade=CHILD_RELATIONSHIP,
        lazy='selectin',
        order_by=[JamModel.period, JamModel.num],
    )
    series: Mapped[SeriesModel] = relationship(
        back_populates='bouts',
        cascade=PARENT_RELATIONSHIP,
        foreign_keys=[series_id],
    )
    teams: Mapped[list[GenericTeamModel]] = relationship(
        back_populates='bout',
        cascade=CHILD_RELATIONSHIP,
        lazy='selectin',
    )
    timeouts: Mapped[list[TimeoutModel]] = relationship(
        cascade=CHILD_RELATIONSHIP,
        lazy='selectin',
    )

    __tablename__: str = 'bouts'
    __mapper_args__: dict[str, Any] = {
        'polymorphic_abstract': True,
        'polymorphic_on': ruleset,
    }

    def __init__(
        self, series: SeriesModel, ruleset: str, *rosters: RosterModel
    ) -> None:
        if len(rosters) < REQUIRED_NUM_TEAMS:
            raise ValueError(f'A Bout must have at least {REQUIRED_NUM_TEAMS} Teams')
        super().__init__(
            series=series,
            clock=ClockModel(),
            ruleset=ruleset,
            teams=[GenericTeamModel(roster) for roster in rosters],
        )

    @final
    @property
    def state(self) -> Literal['final', 'jam', 'lineup', 'stopped', 'timeout']:
        if self.is_final:
            return 'final'
        if len(self.jams) > 0 and self.jams[-1].is_running():
            return 'jam'
        elif len(self.timeouts) > 0 and self.timeouts[-1].is_running():
            return 'timeout'
        elif self.is_running:
            return 'lineup'
        else:
            return 'stopped'

    def begin_period(self, timestamp: datetime) -> None: ...

    def end_period(self, timestamp: datetime) -> None: ...

    def start_jam(self, timestamp: datetime) -> None: ...

    def stop_jam(self, timestamp: datetime) -> None: ...

    def start_timeout(self, timestamp: datetime) -> None: ...

    def stop_timeout(self, timestamp: datetime) -> None: ...

    @cached_property
    def context(self) -> BoutContext: ...


class GenericTeamModel(BaseSQLModel):
    bout_id: Mapped[int] = mapped_column(ForeignKey('bouts.id'))
    roster_id: Mapped[int] = mapped_column(ForeignKey('rosters.id'))

    score_offset: Mapped[int] = mapped_column(default=0)
    timeouts_remaining: Mapped[int] = mapped_column()
    reviews_remaining: Mapped[int] = mapped_column()

    ruleset: MappedSQLExpression[str] = column_property(
        select(GenericBoutModel.ruleset)
        .where(GenericBoutModel.id == bout_id)
        .scalar_subquery()
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
        # order_by=[TeamJamModel.jam.period, TeamJamModel.jam.num], # FIXME
    )
    timeouts: Mapped[list[TimeoutModel]] = relationship(
        back_populates='team',
        cascade=CHILD_RELATIONSHIP,
        lazy='selectin',
    )

    __tablename__: str = 'teams'
    __mapper_args__: dict[str, Any] = {
        'polymorphic_on': ruleset,
    }

    @classmethod
    def get_team_jam_score(cls, team_jam: TeamJamModel) -> int: ...

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
