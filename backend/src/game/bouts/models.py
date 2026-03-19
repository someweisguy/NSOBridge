"""The Bout model and associated business logic."""

from __future__ import annotations

from datetime import datetime  # noqa: TC003
from typing import TYPE_CHECKING, Any, ClassVar, Final, final, override
from uuid import UUID  # noqa: TC003

from core import CASCADE_CHILD, CASCADE_OTHER
from game.clocks.models import Clock
from game.models import CacheableSQLModel, CacheKey
from sqlalchemy import ForeignKey, column
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .schemas import BoutSchema
from .types import BoutStateStr  # noqa: TC001

if TYPE_CHECKING:
    from core import BaseSQLModel
    from game.jams.models import BaseJam
    from game.rulesets.schemas import Ruleset
    from game.series.models import Series
    from game.teams.models import BaseTeam
    from game.timeouts.models import BaseTimeout


REQUIRED_NUM_TEAMS: Final[int] = 2


class BaseBout(CacheableSQLModel):
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
        foreign_keys=[series_uuid],
    )
    clock: Mapped[Clock] = relationship(
        cascade=CASCADE_CHILD,
        foreign_keys=[_clock_uuid],
        lazy='joined',
        single_parent=True,
    )
    teams: Mapped[list[BaseTeam]] = relationship(
        back_populates='_bout',
        cascade=CASCADE_CHILD,
        lazy='selectin',
        order_by=[column('num')],
    )
    jams: Mapped[list[BaseJam]] = relationship(
        back_populates='_bout',
        cascade=CASCADE_CHILD,
        lazy='selectin',
        order_by=[column('period'), column('num')],
    )
    timeouts: Mapped[list[BaseTimeout]] = relationship(
        back_populates='_bout',
        cascade=CASCADE_CHILD,
        lazy='selectin',
        order_by=[column('num')],
    )

    __tablename__: str = 'bouts'
    __mapper_args__: dict[str, Any] = {
        'polymorphic_abstract': True,
        'polymorphic_on': ruleset_name,
    }

    def __str__(self) -> str:
        """Return a str representation of this Bout.

        Returns:
            str: a str representation of this Bout.

        """
        return f'[Bout UUID: {self.uuid}]'

    def __init__(self, ruleset_name: str, *teams: BaseTeam) -> None:
        """Instantiate a Bout.

        Args:
            series (Series): The series to which this Bout belongs.
            ruleset_name (str): The ruleset which the Bout will use.
            teams (tuple[BaseTeam, ...]): the teams which will compete in this Bout.

        """
        super().__init__(clock=Clock(), ruleset_name=ruleset_name, teams=list(teams))

    @override
    async def cache_key(self) -> CacheKey:
        return (self.__tablename__, self.uuid)

    @override
    def serialize(self) -> BoutSchema:
        return BoutSchema.model_validate(self)

    @override
    async def get_parents(self) -> tuple[BaseSQLModel, ...]:
        return ()

    async def get_series(self) -> Series:
        """Get the Series that owns this Bout.

        Returns:
            Series: the Series that owns this Bout.

        """
        return await self.awaitable_attrs._series

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

    def get_active_jam(self) -> BaseJam:
        """Get the most recently started Jam or upcoming Jam.

        Returns:
            BaseJam: the active Jam.

        """
        return next((j for j in self.jams if j.is_started()), self.jams[-1])

    def get_running_jam(self) -> BaseJam | None:
        """Get the running Jam if there is one.

        Returns:
            BaseJam | None: the running Jam or None.

        """
        return next((j for j in self.jams if j.is_running()), None)

    def get_upcoming_jam(self) -> BaseJam | None:
        """Get the upcoming Jam if there is one.

        The upcoming Jam is the first Jam that is not started.

        Returns:
            BaseJam | None: the upcoming Jam or None.

        """
        return next((j for j in self.jams if not j.is_started()), None)

    def get_running_timeout(self) -> BaseTimeout | None:
        """Get the running Timeout if there is one.

        Returns:
            BaseTimeout | None: the running Timeout or None.

        """
        return next((t for t in self.timeouts if t.is_running()), None)

    def get_last_timeout(self) -> BaseTimeout | None:
        """Get most recently complete Timeout if there is one.

        Returns:
            BaseTimeout | None: the most recently complete Timeout or None.

        """
        return next((t for t in reversed(self.timeouts) if not t.is_running()), None)

    async def begin_period(self, timestamp: datetime) -> None:
        """Begin the next Period.

        Args:
            timestamp (datetime): the timestamp at which to begin the Period.

        """
        raise NotImplementedError('begin_period() is not implemented in this model')

    async def end_period(self, timestamp: datetime) -> None:
        """End the current Period.

        Args:
            timestamp (datetime): the timestamp at which to end the Period.

        """
        raise NotImplementedError('end_period() is not implemented in this model')

    async def start_jam(self, timestamp: datetime) -> BaseJam:
        """Start the next Jam.

        Args:
            timestamp (datetime): the timestamp at which to start the Jam.

        Returns:
            BaseJam: the Jam that was started.

        """
        raise NotImplementedError('start_jam() is not implemented in this model')

    async def stop_jam(self, timestamp: datetime) -> BaseJam:
        """Stop the current Jam.

        Args:
            timestamp (datetime): the timestamp at which to stop the Jam.

        Returns:
            BaseJam: the Jam that was stopped.

        """
        raise NotImplementedError('stop_jam() is not implemented in this model')

    async def start_timeout(self, timestamp: datetime) -> BaseTimeout:
        """Call a Timeout.

        Args:
            timestamp (datetime): the timestamp at which to call the Timeout.

        Returns:
            BaseTimeout: the Timeout that was called.

        """
        raise NotImplementedError('start_timeout() is not implemented in this model')

    async def stop_timeout(self, timestamp: datetime) -> BaseTimeout:
        """Stop the current Timeout.

        Args:
            timestamp (datetime): the timestamp at which to stop the Timeout.

        Returns:
            BaseTimeout: the Timeout that was stopped.

        """
        raise NotImplementedError('stop_timeout() is not implemented in this model')
