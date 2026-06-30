"""The Bout model and associated business logic."""

from __future__ import annotations

from datetime import datetime  # noqa: TC003
from typing import TYPE_CHECKING, Any, Final, final, override
from uuid import UUID  # noqa: TC003  # noqa: TC003

from core.db import (
    CASCADE_CHILD,
    CASCADE_OTHER,
    BaseSQLModel,
    CacheableSQLModel,
    CacheKey,
)
from game.jams.models import TeamJam
from game.models import Clock
from game.skaters.models import Skater
from game.timeouts.models import Timeout
from sqlalchemy import Constraint, ForeignKey, UniqueConstraint, column
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from .schemas import BoutSchema
from .types import BoutStateStr, BoutSubStateStr, RulesetProtocol  # noqa: TC001

if TYPE_CHECKING:
    from game.jams.models import Jam
    from game.series.models import Series


REQUIRED_NUM_TEAMS: Final[int] = 2


class BaseBout(CacheableSQLModel, RulesetProtocol):
    """An abstract Bout without any associated ruleset."""

    _clock_uuid: Mapped[UUID] = mapped_column(
        ForeignKey('clocks.uuid', ondelete='RESTRICT')
    )
    series_uuid: Mapped[UUID | None] = mapped_column(ForeignKey('series.uuid'))

    start_countdown: Mapped[datetime | None] = mapped_column(default=None)
    is_final: Mapped[bool] = mapped_column(default=False)
    is_running: Mapped[bool] = mapped_column(default=False)
    ruleset_name: Mapped[str] = mapped_column()

    _series: Mapped[Series | None] = relationship(
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
    __mapper_args__: dict[str, Any] = {
        'polymorphic_on': ruleset_name,
    }

    def __str__(self) -> str:
        """Return a str representation of this Bout.

        Returns:
            str: a str representation of this Bout.

        """
        return f'[Bout UUID: {self.uuid}]'

    def __init__(self, ruleset_name: str, *teams: Team) -> None:
        """Instantiate a Bout.

        Args:
            ruleset_name (str): the name of the ruleset to use. This must be one of the
            currently implemented rulesets.
            teams (tuple[BaseTeam, ...]): the teams which will compete in this Bout. The
            first team in the sequence is considered the home team.

        """
        for i, team in enumerate(teams):
            team.num = i
        super().__init__(ruleset_name=ruleset_name, clock=Clock(), teams=list(teams))

    @final
    @override
    def cache_key(self) -> CacheKey:
        return (self.__tablename__, self.uuid)

    @final
    @override
    def serialize(self) -> BoutSchema:
        return BoutSchema.model_validate(self)

    @final
    @override
    def get_parents(self) -> tuple[BaseSQLModel, ...]:
        return ()

    def get_series(self) -> Series | None:
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

    @final
    @property
    def sub_state(self) -> BoutSubStateStr:  # noqa: C901, PLR0911, PLR0912
        """Get the sub-state of the Bout.

        The sub-state is used for more descriptive event states.
        """
        latest_timeout: Timeout | None = self.get_last_timeout()
        match self.state:
            case 'lineup' as state:
                active_jam: Jam = self.get_active_jam()
                if (
                    latest_timeout is None
                    or active_jam.stop_timestamp is None
                    or latest_timeout.stop_timestamp is None
                    or latest_timeout.stop_timestamp <= active_jam.stop_timestamp
                ):
                    return state
                elif latest_timeout.is_review:
                    return 'post_review'
                else:
                    return 'post_timeout'
            case 'timeout':
                if latest_timeout is None or (
                    not latest_timeout.team_is_officials and latest_timeout.team is None
                ):
                    return 'timeout'
                elif latest_timeout.is_review:
                    return 'review'
                elif latest_timeout.team is not None:
                    return 'team_timeout'
                else:
                    return 'official_timeout'
            case 'stopped':
                latest_jam: Jam = self.jams[-1]
                if latest_jam.period == 0:
                    return 'pregame'
                elif latest_jam.period == 1:
                    return 'halftime'
                else:
                    return 'unofficial'
            case default:
                return default

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

    def get_active_jam(self) -> Jam:
        """Get the most recently started Jam or upcoming Jam.

        Returns:
            BaseJam: the active Jam.

        """
        return (
            self.get_running_jam() or self.jams[-2]
            if len(self.jams) > 1
            else self.jams[-1]
        )

    def get_running_jam(self) -> Jam | None:
        """Get the running Jam if there is one.

        Returns:
            BaseJam | None: the running Jam or None.

        """
        return next((j for j in self.jams if j.is_running()), None)

    def get_upcoming_jam(self) -> Jam | None:
        """Get the upcoming Jam if there is one.

        The upcoming Jam is the first Jam that is not started.

        Returns:
            BaseJam | None: the upcoming Jam or None.

        """
        return next((j for j in self.jams if not j.is_started()), None)

    def get_running_timeout(self) -> Timeout | None:
        """Get the running Timeout if there is one.

        Returns:
            BaseTimeout | None: the running Timeout or None.

        """
        return next((t for t in self.timeouts if t.is_running()), None)

    def get_last_timeout(self) -> Timeout | None:
        """Get most recently complete Timeout if there is one.

        Returns:
            BaseTimeout | None: the most recently complete Timeout or None.

        """
        return next((t for t in reversed(self.timeouts) if not t.is_running()), None)


class Team(BaseSQLModel):
    """An abstract Team without any associated ruleset.

    A Team contains team-related information in a given Bout. Example information
    includes the number timeouts and official reviews remaining, as well as more obscure
    data like a team's score offset.
    """

    bout_uuid: Mapped[UUID | None] = mapped_column(
        ForeignKey('bouts.uuid'), nullable=False
    )

    num: Mapped[int] = mapped_column(default=0)

    name: Mapped[str] = mapped_column()
    league: Mapped[str] = mapped_column(default='')
    mnemonic: Mapped[str] = mapped_column(default='')
    # TODO: Implement Team colors
    score_offset: Mapped[int] = mapped_column(default=0)
    timeouts_remaining: Mapped[int] = mapped_column(default=0)
    reviews_remaining: Mapped[int] = mapped_column(default=0)

    _bout: Mapped[BaseBout] = relationship(
        back_populates='teams',
        cascade=CASCADE_OTHER,
        lazy='selectin',
        foreign_keys=[bout_uuid],
    )
    skaters: Mapped[list[Skater]] = relationship(
        back_populates='_team',
        cascade=CASCADE_CHILD,
        lazy='selectin',
        order_by=[Skater.num],
    )
    team_jams: Mapped[list[TeamJam]] = relationship(
        back_populates='_team',
        cascade=CASCADE_CHILD,
        lazy='selectin',
        order_by=[TeamJam.period_num, TeamJam.jam_num],
    )
    timeouts: Mapped[list[Timeout]] = relationship(
        back_populates='team',
        cascade='all',  # Exclude `delete-orphan` as Timeouts can be called by officials
        lazy='selectin',
        order_by=[Timeout.num],
    )

    __tablename__: str = 'teams'
    __table_args__: tuple[Constraint, ...] = (UniqueConstraint('bout_uuid', 'num'),)

    def __init__(self, name: str) -> None:
        """Initialize a Team.

        Args:
            name (str): the name of this Team.

        """
        super().__init__(name=name)

    @override
    def get_parents(self) -> tuple[BaseSQLModel, ...]:
        return (self._bout,)

    def get_bout(self) -> BaseBout:
        """Get the Bout to which this Team belongs.

        Returns:
            BaseBout: the Bout to which this Team belongs.

        """
        return self._bout

    @property
    def bout_score(self) -> int:
        """Calculate the total bout score of this Team.

        This method may change depending on the ruleset of the owning Bout.

        Returns:
            int: the total bout score of this Team.

        """
        bout_score: int = 0
        for team_jam in self.team_jams:
            bout_score += self._bout.get_team_jam_score(team_jam)
        return bout_score

    @property
    def jam_score(self) -> int:
        """Calculate the current jam score of this Team.

        This method may change depending on the ruleset of the owning Bout.

        Returns:
            int: the current jam score of this Team.

        """
        for team_jam in reversed(self.team_jams):
            if team_jam.jam.is_started():
                break
        return self._bout.get_team_jam_score(team_jam)
