from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime  # noqa: TC003
from functools import cached_property
from typing import TYPE_CHECKING, Any, Final, Literal, final

from game.clocks.models import Clock
from models import (
    CHILD_RELATIONSHIP,
    PARENT_RELATIONSHIP,
    CacheableSQLModel,
)
from sqlalchemy import ForeignKey, column
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

if TYPE_CHECKING:
    from datetime import timedelta

    from game.jams.models import BaseJam
    from game.series.models import Series
    from game.teams.models import BaseTeam
    from game.timeouts.models import Timeout


REQUIRED_NUM_TEAMS: Final[int] = 2


@dataclass(frozen=True)
class BoutContext:
    jam_duration: timedelta
    lineup_duration: timedelta
    points_per_trip: int
    num_timeouts: int
    num_reviews: int


class BaseBout(CacheableSQLModel):
    series_id: Mapped[int] = mapped_column(ForeignKey('series.id'))
    clock_id: Mapped[int] = mapped_column(ForeignKey('clocks.id', ondelete='RESTRICT'))

    start_countdown: Mapped[datetime | None] = mapped_column(default=None)
    is_final: Mapped[bool] = mapped_column(default=False)
    is_running: Mapped[bool] = mapped_column(default=False)
    ruleset: Mapped[str] = mapped_column()

    clock: Mapped[Clock] = relationship(
        cascade=CHILD_RELATIONSHIP,
        foreign_keys=[clock_id],
        lazy='joined',
        single_parent=True,
    )
    jams: Mapped[list[BaseJam]] = relationship(
        back_populates='bout',
        cascade=CHILD_RELATIONSHIP,
        lazy='selectin',
        order_by=[column('period'), column('num')],
    )
    series: Mapped[Series] = relationship(
        back_populates='bouts',
        cascade=PARENT_RELATIONSHIP,
        foreign_keys=[series_id],
    )
    teams: Mapped[list[BaseTeam]] = relationship(
        back_populates='bout',
        cascade=CHILD_RELATIONSHIP,
        lazy='selectin',
    )
    timeouts: Mapped[list[Timeout]] = relationship(
        cascade=CHILD_RELATIONSHIP,
        lazy='selectin',
    )

    __tablename__: str = 'bouts'
    __mapper_args__: dict[str, Any] = {
        'polymorphic_abstract': True,
        'polymorphic_on': ruleset,
    }

    def __init__(self, series: Series, ruleset: str) -> None:
        super().__init__(series=series, clock=Clock(bout=self), ruleset=ruleset)

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
