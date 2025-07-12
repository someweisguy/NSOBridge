from __future__ import annotations

from typing import TYPE_CHECKING, Callable, ClassVar, Final
from weakref import ReferenceType, WeakSet, ref

from pydantic import Field, computed_field

from core.models import ProjectModel

if TYPE_CHECKING:
    from core.models.bout.jam import TeamJam


class Roster(ProjectModel):
    name: str = Field('')
    # TODO: mnemonic: str
    # TODO: league
    # TODO: color
    # TODO: skaters: list[Skater]

    def __init__(self, name: str) -> None:
        super().__init__(name=name)


def _uninitialized_score_strategy(_: TeamJam) -> int:
    raise NotImplementedError('This Team has not been properly initialized')


class Team(ProjectModel):
    HOME: ClassVar[Final[int]] = 0
    AWAY: ClassVar[Final[int]] = 1

    roster: Roster = Field()
    timeouts: int = Field(0, init=False)
    reviews: int = Field(0, init=False)
    score_offset: int = Field(0, init=False)

    _score_strategy: Callable[[TeamJam], int]

    _most_recent_jam: ReferenceType[TeamJam] | None = None
    _team_jams: WeakSet[TeamJam] = WeakSet()

    @classmethod
    def create(cls, roster: Roster) -> Team:
        team: Team = Team.create(roster=roster)
        team.set_score_strategy(_uninitialized_score_strategy)
        return team

    def add_team_jam(self, team_jam: TeamJam) -> None:
        if team_jam.team != self:
            raise ValueError('Cannot add a TeamJam that does not belong to this Team')
        self._most_recent_jam = ref(team_jam)
        self._team_jams.add(team_jam)

    @property
    @computed_field
    def game_score(self) -> int:
        return sum(
            [self._score_strategy(team_jam) for team_jam in self._team_jams],
            self.score_offset,
        )

    @property
    @computed_field
    def jam_score(self) -> int:
        team_jam: TeamJam | None = (
            self._most_recent_jam() if self._most_recent_jam is not None else None
        )
        if team_jam is None and len(self._team_jams) > 0:
            max_period_num: int = int(
                any(team_jam.period_num == 1 for team_jam in self._team_jams)
            )
            team_jam = max(
                [
                    team_jam
                    for team_jam in self._team_jams
                    if team_jam.period_num == max_period_num
                ],
                key=lambda jam_team: jam_team.jam_num,
            )
            self._most_recent_jam = ref(team_jam)
        return self._score_strategy(team_jam) if team_jam is not None else 0

    @property
    @computed_field
    def num_jams(self) -> int:
        return len(self._team_jams)

    def period_score(self, period: int) -> int:
        return sum(
            [
                self._score_strategy(team_jam)
                for team_jam in self._team_jams
                if team_jam.period_num == period
            ]
        )

    def set_score_strategy(self, strategy: Callable[[TeamJam], int]) -> None:
        self._score_strategy = staticmethod(strategy)
