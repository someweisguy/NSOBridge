from __future__ import annotations

from abc import abstractmethod
from dataclasses import dataclass
from datetime import datetime  # noqa: TC003
from functools import cached_property
from typing import TYPE_CHECKING, Final, Literal, final

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.jam import JamModel, TeamJamModel, TeamName
from models.models import CacheableModel, SQLModel
from models.time import ClockModel

if TYPE_CHECKING:
    from datetime import timedelta

    from models.team import TeamModel
    from models.time import TimeoutModel


REQUIRED_NUM_TEAMS: Final[int] = 2


@dataclass(frozen=True)
class BoutContext:
    jam_duration: timedelta
    lineup_duration: timedelta
    points_per_trip: int
    num_timeouts: int
    num_reviews: int


class GenericBoutModel(CacheableModel):
    __tablename__ = 'bouts'

    _clock_id: Mapped[int] = mapped_column(ForeignKey('clocks.id', ondelete='RESTRICT'))

    ruleset: Mapped[str] = mapped_column()
    is_running: Mapped[bool] = mapped_column(default=False)
    expected_start_timestamp: Mapped[datetime | None] = mapped_column(default=None)
    is_final: Mapped[bool] = mapped_column(default=False)

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

    @abstractmethod
    def add_trip(self, team: TeamName, passes: int, timestamp: datetime) -> None: ...

    @abstractmethod
    def clear_track(self, timestamp: datetime) -> None: ...

    @abstractmethod
    def set_lead(self, team: TeamName, lead: bool, timestamp: datetime) -> None: ...

    @abstractmethod
    def set_lost(self, team: TeamName, lost: bool) -> None: ...

    @abstractmethod
    def set_star_pass(self, team: TeamName, timestamp: datetime) -> None: ...

    @abstractmethod
    def setup_track(self, timestamp: datetime) -> None: ...

    @abstractmethod
    def start_jam(self, timestamp: datetime) -> JamModel: ...

    @abstractmethod
    def start_timeout(self, timestamp: datetime) -> TimeoutModel: ...

    @abstractmethod
    def stop_jam(self, timestamp: datetime) -> None: ...

    @abstractmethod
    def stop_timeout(self, timestamp: datetime) -> None: ...
