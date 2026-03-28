"""The Bout model and associated business logic."""

from __future__ import annotations

from datetime import datetime  # noqa: TC003
from typing import TYPE_CHECKING, ClassVar, Final, final, override
from uuid import UUID  # noqa: TC003

from db import CASCADE_CHILD, CASCADE_OTHER, CacheableSQLModel
from game.clocks.models import Clock
from sqlalchemy import ForeignKey, column
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .schemas import BoutSchema
from .types import BoutStateStr  # noqa: TC001

if TYPE_CHECKING:
    from core import CacheKey
    from db import BaseSQLModel
    from game.jams.models import Jam
    from game.rulesets.schemas import Ruleset
    from game.series.models import Series
    from game.team_jams.models import TeamJam
    from game.teams.models import Team
    from game.timeouts.models import Timeout


REQUIRED_NUM_TEAMS: Final[int] = 2


class Bout(CacheableSQLModel):
    """An abstract Bout without any associated ruleset."""

    ruleset: ClassVar[Ruleset]

    _clock_uuid: Mapped[UUID] = mapped_column(
        ForeignKey('clocks.uuid', ondelete='RESTRICT')
    )
    series_uuid: Mapped[UUID] = mapped_column(ForeignKey('series.uuid'))

    start_countdown: Mapped[datetime | None] = mapped_column(default=None)
    is_final: Mapped[bool] = mapped_column(default=False)
    is_running: Mapped[bool] = mapped_column(default=False)
    ruleset_name: Mapped[str] = mapped_column()

    _series: Mapped[Series] = relationship(
        back_populates='bouts',
        cascade=CASCADE_OTHER,
        lazy='selectin',
        foreign_keys=[series_uuid],
    )
    clock: Mapped[Clock] = relationship(
        cascade=CASCADE_CHILD,
        foreign_keys=[_clock_uuid],
        lazy='joined',
        single_parent=True,
    )
    teams: Mapped[list[Team]] = relationship(
        back_populates='_bout',
        cascade=CASCADE_CHILD,
        lazy='selectin',
        order_by=[column('num')],
    )
    jams: Mapped[list[Jam]] = relationship(
        back_populates='_bout',
        cascade=CASCADE_CHILD,
        lazy='selectin',
        order_by=[column('period'), column('num')],
    )
    timeouts: Mapped[list[Timeout]] = relationship(
        back_populates='_bout',
        cascade=CASCADE_CHILD,
        lazy='selectin',
        order_by=[column('num')],
    )

    __tablename__: str = 'bouts'

    def __str__(self) -> str:
        """Return a str representation of this Bout.

        Returns:
            str: a str representation of this Bout.

        """
        return f'[Bout UUID: {self.uuid}]'

    def __init__(self, *teams: Team) -> None:
        """Instantiate a Bout.

        Args:
            series (Series): The series to which this Bout belongs.
            teams (tuple[BaseTeam, ...]): the teams which will compete in this Bout.

        """
        super().__init__(clock=Clock(), teams=list(teams))

    @override
    def cache_key(self) -> CacheKey:
        return (self.__tablename__, self.uuid)

    @override
    def serialize(self) -> BoutSchema:
        return BoutSchema.model_validate(self)

    @override
    async def get_parents(self) -> tuple[BaseSQLModel, ...]:
        return ()

    def get_series(self) -> Series:
        """Get the Series that owns this Bout.

        Returns:
            Series: the Series that owns this Bout.

        """
        return self._series

    @final
    @property
    def state(self) -> BoutStateStr:
        """Get the current state of the Bout.

        Returns:
           'final': the Bout is finalized.
           'jam': a Jam is running.
           'timeout': a Timeout is running.
           'lineup': skaters are lining up before a Jam.
           'stopped': the Bout is in a period break such as halftime.

        """
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

    def get_team_jam_score(self, team_jam: TeamJam) -> int:
        """Calculate the score in the desired TeamJam.

        This method may change depending on the ruleset of the owning Bout.

        Args:
            team_jam (TeamJam): the TeamJam with which to calculate the score.

        Returns:
            int: the calculated score of the TeamJam.

        """
        jam_score: int = 0
        for event in team_jam.events:
            if event.passes is not None:
                jam_score += event.passes
        return jam_score
