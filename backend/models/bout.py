from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime  # noqa: TC003
from functools import cached_property
from typing import TYPE_CHECKING, Final, Literal, final, override

from sqlalchemy import Constraint, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .jam import JamModel, TeamJamModel
from .models import CacheableModel
from .team import TeamModel
from .time import ClockModel, TimeoutModel

if TYPE_CHECKING:
    from datetime import timedelta

    from core.database import SQLModel

    from .series import SeriesModel
    from .team import RosterModel


REQUIRED_NUM_TEAMS: Final[int] = 2


@dataclass(frozen=True)
class BoutContext:
    jam_duration: timedelta
    lineup_duration: timedelta
    points_per_trip: int
    num_timeouts: int
    num_reviews: int


class GenericBoutModel(CacheableModel):
    __tablename__: str = 'bouts'

    _series_id: Mapped[int] = mapped_column(ForeignKey('series.id'))
    _clock_id: Mapped[int] = mapped_column(ForeignKey('clocks.id', ondelete='RESTRICT'))
    expected_start_timestamp: Mapped[datetime | None] = mapped_column(default=None)
    is_final: Mapped[bool] = mapped_column(default=False)
    is_running: Mapped[bool] = mapped_column(default=False)
    order: Mapped[int] = mapped_column()
    ruleset: Mapped[str] = mapped_column()

    clock: Mapped[ClockModel] = relationship(
        cascade='all, delete-orphan',
        foreign_keys=[_clock_id],
        lazy='joined',
        single_parent=True,
    )
    jams: Mapped[list[JamModel]] = relationship(
        back_populates='bout',
        cascade='all, delete-orphan',
        lazy='selectin',
        load_on_pending=True,
        order_by=[JamModel.period, JamModel.jam],
    )
    series: Mapped[SeriesModel] = relationship(foreign_keys=[_series_id], lazy='select')
    teams: Mapped[list[TeamModel]] = relationship(
        back_populates='bout', cascade='all, delete-orphan', lazy='selectin'
    )
    timeouts: Mapped[list[TimeoutModel]] = relationship(
        cascade='all, delete-orphan', lazy='selectin'
    )

    __table_args__: tuple[Constraint] = (UniqueConstraint(_series_id, order),)
    __mapper_args__: dict[str, str | bool] = {
        'polymorphic_abstract': True,
        'polymorphic_on': 'ruleset',
    }

    @classmethod
    def calculate_score(cls, team_jam: TeamJamModel) -> int:
        # Sum the Trip passes, ignoring the first Trip
        return sum(trip.passes for trip in team_jam.events if trip.passes is not None)

    @classmethod
    def fetch_team_bout_score(cls, team: TeamModel) -> int:
        return sum(cls.calculate_score(team_jam) for team_jam in team.team_jams)

    @classmethod
    def fetch_team_jam_score(cls, team: TeamModel) -> int:
        if len(team.team_jams) == 0:
            return 0
        return cls.calculate_score(team.team_jams[-1])

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
            teams=[TeamModel(roster) for roster in rosters],
        )

    @final
    @property
    @override
    def parents(self) -> tuple[SQLModel, ...]:
        return (self.series,)

    @final
    @property
    @override
    def key(self) -> tuple[str, int | None]:
        return (self.__tablename__, self.id)

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

    @final
    def get_period(self) -> int:
        return 0 if len(self.jams) == 0 else self.jams[-1].period

    def get_latest_played_jam(self) -> JamModel | None:
        if len(self.jams) == 0:
            return None
        jam: JamModel | None = self.jams[-1]
        if jam.start_timestamp is None:
            jam = self.jams[-2] if len(self.jams) > 1 else None
        return jam

    @cached_property
    def context(self) -> BoutContext: ...
