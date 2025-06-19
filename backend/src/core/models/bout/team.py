from __future__ import annotations

from typing import TYPE_CHECKING, ClassVar, Final
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


class Team(ProjectModel):
    HOME: ClassVar[Final[int]] = 0
    AWAY: ClassVar[Final[int]] = 1

    roster: Roster = Field()
    timeouts: int = Field(3, init=False)
    reviews: int = Field(1, init=False)
    score_offset: int = Field(0, init=False)

    _most_recent_jam: ReferenceType[TeamJam] = None
    _team_jams: WeakSet[TeamJam] = WeakSet()

    def __init__(self, roster: Roster) -> None:
        super().__init__(roster=roster)

    def add_team_jam(self, team_jam: TeamJam) -> None:
        if team_jam.team != self:
            raise ValueError('Cannot add a TeamJam that does not belong to this Team')
        self._most_recent_jam = ref(team_jam)
        self._team_jams.add(team_jam)

    @computed_field
    @property
    def game_score(self) -> int:
        return sum(
            [trip.points for jam in self._team_jams for trip in jam.trips],
            self.score_offset,
        )

    @computed_field
    @property
    def jam_score(self) -> int:
        team_jam: TeamJam | None = (
            self._most_recent_jam() if self._most_recent_jam is not None else None
        )
        if team_jam is None and len(self._team_jams) > 0:
            max_period_num: int = int(
                any(team_jam.id.period == 1 for team_jam in self._team_jams)
            )
            team_jam = max(
                [
                    team_jam
                    for team_jam in self._team_jams
                    if team_jam.id.period == max_period_num
                ],
                key=lambda jam_team: jam_team.id.jam,
            )
            self._most_recent_jam = ref(team_jam)
        return (
            sum([trip.points for trip in team_jam.trips]) if team_jam is not None else 0
        )

    @computed_field
    @property
    def num_jams(self) -> int:
        return len(self._team_jams)

    def period_score(self, period: int) -> int:
        return sum(
            [
                trip.points
                for team_jam in self._team_jams
                if team_jam.id.period == period
                for trip in team_jam.trips
            ]
        )
