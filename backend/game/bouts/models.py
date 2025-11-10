from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime  # noqa: TC003
from functools import cached_property
from typing import TYPE_CHECKING, Any, Final, Literal, final

from game.clocks.models import ClockModel
from models import (
    CHILD_RELATIONSHIP,
    PARENT_RELATIONSHIP,
    CacheableSQLModel,
)
from sqlalchemy import ForeignKey
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

if TYPE_CHECKING:
    from datetime import timedelta

    from game.jams.models import BaseJamModel
    from game.series.models import SeriesModel
    from game.teams.models import BaseTeamModel
    from game.timeouts.models import TimeoutModel


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

    start_countdown: Mapped[datetime | None] = mapped_column(default=None)
    is_final: Mapped[bool] = mapped_column(default=False)
    is_running: Mapped[bool] = mapped_column(default=False)
    ruleset: Mapped[str] = mapped_column()

    clock: Mapped[ClockModel] = relationship(
        cascade=CHILD_RELATIONSHIP,
        foreign_keys=[clock_id],
        lazy='joined',
        single_parent=True,
    )
    jams: Mapped[list[BaseJamModel]] = relationship(
        back_populates='bout',
        cascade=CHILD_RELATIONSHIP,
        lazy='selectin',
        # order_by=[JamModel.period, JamModel.num],  # TODO: uncomment
    )
    series: Mapped[SeriesModel] = relationship(
        back_populates='bouts',
        cascade=PARENT_RELATIONSHIP,
        foreign_keys=[series_id],
    )
    teams: Mapped[list[BaseTeamModel]] = relationship(
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

    def __init__(self, series: SeriesModel, ruleset: str) -> None:
        super().__init__(series=series, clock=ClockModel(bout=self), ruleset=ruleset)

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
    def context(self) -> BoutContext:
        raise NotImplementedError()
