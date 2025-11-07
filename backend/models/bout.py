from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime  # noqa: TC003
from functools import cached_property
from typing import TYPE_CHECKING, Final, Literal, final

from core import (
    CHILD_RELATIONSHIP,
    PARENT_RELATIONSHIP,
    BaseSQLModel,
    CacheableSQLModel,
)
from sqlalchemy import Constraint, ForeignKey, UniqueConstraint, select
from sqlalchemy.orm import (
    Mapped,
    column_property,
    mapped_column,
    relationship,
)

from .jam import JamModel, TeamJamModel
from .time import ClockModel, TimeoutModel

if TYPE_CHECKING:
    from datetime import timedelta

    from .roster import RosterModel
    from .series import SeriesModel


REQUIRED_NUM_TEAMS: Final[int] = 2


@dataclass(frozen=True)
class BoutContext:
    jam_duration: timedelta
    lineup_duration: timedelta
    points_per_trip: int
    num_timeouts: int
    num_reviews: int


class GenericBoutModel(CacheableSQLModel):
    __tablename__: str = 'bouts'

    _series_id: Mapped[int] = mapped_column(ForeignKey('series.id'))
    _clock_id: Mapped[int] = mapped_column(ForeignKey('clocks.id', ondelete='RESTRICT'))
    expected_start_timestamp: Mapped[datetime | None] = mapped_column(default=None)
    is_final: Mapped[bool] = mapped_column(default=False)
    is_running: Mapped[bool] = mapped_column(default=False)
    order: Mapped[int] = mapped_column()
    ruleset: Mapped[str] = mapped_column()

    clock: Mapped[ClockModel] = relationship(
        cascade=CHILD_RELATIONSHIP,
        foreign_keys=[_clock_id],
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
        cascade=PARENT_RELATIONSHIP, foreign_keys=[_series_id], lazy='select'
    )
    teams: Mapped[list[GenericTeamModel]] = relationship(
        back_populates='bout',
        cascade=CHILD_RELATIONSHIP,
        lazy='selectin',
    )
    timeouts: Mapped[list[TimeoutModel]] = relationship(
        cascade=CHILD_RELATIONSHIP, lazy='selectin'
    )

    __table_args__: tuple[Constraint] = (UniqueConstraint(_series_id, order),)
    __mapper_args__: dict[str, str | bool] = {
        'polymorphic_abstract': True,
        'polymorphic_on': 'ruleset',
    }

    def __init__(
        self, series: SeriesModel, ruleset: str, *rosters: RosterModel
    ) -> None:
        if len(rosters) < REQUIRED_NUM_TEAMS:
            raise ValueError(f'A Bout must have at least {REQUIRED_NUM_TEAMS} Teams')
        order: int = 0 if len(series.bouts) == 0 else series.bouts[-1].order + 1
        super().__init__(
            series=series,
            order=order,
            clock=ClockModel(),
            ruleset=ruleset,
            teams=[GenericTeamModel(roster) for roster in rosters],
        )

    @final
    def get_state(self) -> Literal['final', 'jam', 'lineup', 'stopped', 'timeout']:
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
    __tablename__: str = 'teams'

    _bout_id: Mapped[int] = mapped_column(ForeignKey('bouts.id'))
    _roster_id: Mapped[int] = mapped_column(ForeignKey('rosters.id'))
    reviews_remaining: Mapped[int] = mapped_column()
    score_offset: Mapped[int] = mapped_column(default=0)
    timeouts_remaining: Mapped[int] = mapped_column()

    ruleset = column_property(
        select(GenericBoutModel.ruleset)
        .where(GenericBoutModel.id == _bout_id)
        .scalar_subquery()
    )

    bout: Mapped[GenericBoutModel | None] = relationship(
        cascade=PARENT_RELATIONSHIP, lazy='selectin'
    )
    roster: Mapped[RosterModel | None] = relationship(
        cascade=PARENT_RELATIONSHIP, foreign_keys=[_roster_id], lazy='joined'
    )
    team_jams: Mapped[list[TeamJamModel]] = relationship(
        back_populates='team',
        cascade=CHILD_RELATIONSHIP,
        lazy='selectin',
        # order_by=[TeamJamModel.jam.period, TeamJamModel.jam.num], # FIXME
    )
    timeouts: Mapped[list[TimeoutModel]] = relationship(
        back_populates='team', cascade=CHILD_RELATIONSHIP, lazy='selectin'
    )

    __mapper_args__: dict[str, str | bool] = {
        'polymorphic_on': 'ruleset',
    }

    @classmethod
    def get_team_jam_score(cls, team_jam: TeamJamModel) -> int: ...

    def __init__(self, roster: RosterModel):
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
