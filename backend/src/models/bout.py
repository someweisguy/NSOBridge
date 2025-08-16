from __future__ import annotations

from abc import abstractmethod
from dataclasses import dataclass
from functools import cached_property
from typing import TYPE_CHECKING, Final, final

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.jam import JamModel, TeamJamModel, TeamName
from models.models import CacheableModel, SQLModel
from models.time import ClockModel

if TYPE_CHECKING:
    from datetime import datetime

    from models.team import TeamModel
    from models.time import TimeoutModel, TimerModel


REQUIRED_NUM_TEAMS: Final[int] = 2


@dataclass(frozen=True)
class BoutContext:
    points_per_trip: int
    num_timeouts: int
    num_reviews: int


class GenericBoutModel(CacheableModel):
    __tablename__ = 'bouts'

    _clock_id: Mapped[int] = mapped_column(ForeignKey('clocks.id', ondelete='RESTRICT'))
    _timer_id: Mapped[int | None] = mapped_column(
        ForeignKey('timers.id', ondelete='CASCADE')
    )

    ruleset: Mapped[str] = mapped_column()

    clock: Mapped[ClockModel] = relationship(foreign_keys=[_clock_id], lazy='joined')
    jams: Mapped[list[JamModel]] = relationship(
        back_populates='bout',
        lazy='selectin',
        load_on_pending=True,
        order_by=[JamModel.period, JamModel.jam],
    )
    teams: Mapped[list[TeamModel]] = relationship(
        back_populates='bout', lazy='selectin'
    )
    timeouts: Mapped[list[TimeoutModel]] = relationship(lazy='selectin')
    timer: Mapped[TimerModel | None] = relationship(
        foreign_keys=[_timer_id], lazy='joined'
    )

    __mapper_args__ = {
        'polymorphic_on': 'ruleset',
    }

    @classmethod
    def calculate_score(cls, team_jam: TeamJamModel) -> int:
        # Sum the Trip passes, ignoring the first Trip
        return sum(trip.passes for trip in team_jam.trips)

    @classmethod
    def fetch_team_bout_score(cls, team: TeamModel) -> int:
        return sum(cls.calculate_score(team_jam) for team_jam in team.team_jams)

    @classmethod
    def fetch_team_jam_score(cls, team: TeamModel) -> int:
        if len(team.team_jams) == 0:
            return 0
        return cls.calculate_score(team.team_jams[-1])

    def __init__(self, ruleset: str, *teams: TeamModel) -> None:
        if len(teams) < REQUIRED_NUM_TEAMS:
            raise ValueError(f'A Bout must have at least {REQUIRED_NUM_TEAMS} Teams')
        super().__init__(clock=ClockModel(), ruleset=ruleset, teams=list(teams))

    @final
    @property
    def parents(self) -> tuple[SQLModel, ...]:
        return ()

    @final
    @property
    def key(self) -> tuple[str, int]:
        return (self.__tablename__, self.id)

    @cached_property
    @abstractmethod
    def context(self) -> BoutContext: ...

    @abstractmethod
    def add_trip(self, team: TeamName, passes: int, timestamp: datetime) -> None: ...

    @abstractmethod
    def set_lead(self, team: TeamName, lead: bool, timestamp: datetime) -> None: ...

    @abstractmethod
    def set_lost(self, team: TeamName, lost: bool) -> None: ...

    @abstractmethod
    def set_star_pass(self, team: TeamName, timestamp: datetime) -> None: ...

    @abstractmethod
    def start(self, timestamp: datetime) -> None: ...

    @abstractmethod
    def start_jam(self, timestamp: datetime) -> JamModel: ...

    @abstractmethod
    def start_timeout(self, timestamp: datetime) -> TimeoutModel: ...

    @abstractmethod
    def stop(self, timestamp: datetime) -> None: ...

    @abstractmethod
    def stop_jam(self, timestamp: datetime) -> None: ...

    @abstractmethod
    def stop_timeout(self, timestamp: datetime) -> None: ...
