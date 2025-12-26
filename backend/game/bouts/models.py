from __future__ import annotations

from datetime import datetime  # noqa: TC003
from typing import TYPE_CHECKING, Any, ClassVar, Final, Literal, final, override

from core.models import CHILD_RELATIONSHIP, PARENT_RELATIONSHIP
from game.clocks.models import Clock
from game.models import CacheableSQLModel, CacheKey
from sqlalchemy import ForeignKey, column
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

if TYPE_CHECKING:
    from game.jams.models import BaseJam
    from game.rulesets.schemas import Ruleset
    from game.series.models import Series
    from game.teams.models import BaseTeam
    from game.timeouts.models import BaseTimeout


REQUIRED_NUM_TEAMS: Final[int] = 2


class BaseBout(CacheableSQLModel):
    rules: ClassVar[Ruleset]

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
    timeouts: Mapped[list[BaseTimeout]] = relationship(
        cascade=CHILD_RELATIONSHIP,
        lazy='selectin',
        order_by=[column('id')],
    )

    __tablename__: str = 'bouts'
    __mapper_args__: dict[str, Any] = {
        'polymorphic_abstract': True,
        'polymorphic_on': ruleset,
    }

    def __init__(self, series: Series, ruleset: str) -> None:
        super().__init__(series=series, clock=Clock(bout=self), ruleset=ruleset)

    @override
    def cache_key(self) -> CacheKey:
        return (self.__tablename__, self.id)

    @final
    @property
    def state(self) -> Literal['final', 'jam', 'lineup', 'stopped', 'timeout']:
        if self.is_final:
            return 'final'
        if any(jam.is_running() for jam in self.jams):
            return 'jam'
        elif any(timeout.is_running() for timeout in self.timeouts):
            return 'timeout'
        elif self.is_running:
            return 'lineup'
        else:
            return 'stopped'

    def get_running_jam(self) -> BaseJam | None:
        return next((j for j in self.jams if j.is_running()), None)

    def get_upcoming_jam(self) -> BaseJam | None:
        return next((j for j in self.jams if not j.is_started()), None)

    def get_running_timeout(self) -> BaseTimeout | None:
        return next((t for t in self.timeouts if t.is_running()), None)

    def get_upcoming_timeout(self) -> BaseTimeout | None:
        return next((t for t in self.timeouts if not t.is_started()), None)

    def begin_period(self, timestamp: datetime) -> None: ...

    def end_period(self, timestamp: datetime) -> None: ...

    def start_jam(self, timestamp: datetime) -> BaseJam: ...

    def stop_jam(self, timestamp: datetime) -> BaseJam: ...

    def start_timeout(self, timestamp: datetime) -> BaseTimeout: ...

    def stop_timeout(self, timestamp: datetime) -> BaseTimeout: ...
