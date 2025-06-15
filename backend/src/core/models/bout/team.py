from __future__ import annotations

from typing import TYPE_CHECKING, ClassVar, Final, Literal
from weakref import ReferenceType, WeakSet, ref

from pydantic import Field, computed_field

from core.models import ProjectModel

if TYPE_CHECKING:
    from core.models.bout.jam import Jam, TeamJam


type TeamString = Literal['home', 'away']


class Roster(ProjectModel):
    name: str = Field('')
    # TODO: league
    # TODO: color
    # TODO: skaters: list[Skater]

    def __init__(self, name: str) -> None:
        super().__init__(name=name)


class Team(ProjectModel):
    HOME: ClassVar[Final[int]] = 0
    AWAY: ClassVar[Final[int]] = 1

    roster: Roster
    timeouts: int = Field(3, init=False)
    reviews: int = Field(1, init=False)
    score_offset: int = Field(0, init=False)

    _most_recent_jam: ReferenceType[TeamJam] = None
    _jam_teams: WeakSet[TeamJam] = WeakSet()

    def __init__(self, roster: Roster) -> None:
        super().__init__(roster=roster)

    def join_jam(self, jam: Jam) -> TeamJam:
        jam_team = TeamJam(jam)
        self._most_recent_jam = ref(jam_team)
        self._jam_teams.add(jam_team)
        return jam_team

    @property
    @computed_field
    def bout_score(self) -> int:
        return sum([trip.points for jam in self._jam_teams for trip in jam.trips])

    @property
    @computed_field
    def jam_score(self) -> int:
        jam: TeamJam | None = (
            self._most_recent_jam() if self._most_recent_jam is not None else None
        )
        if jam is None and len(self._jam_teams) > 0:
            max_period_num: int = any(
                jam._parent_jam.id[0] == 1 for jam in self._jam_teams
            )
            jam = max(
                [
                    jam_team
                    for jam_team in self._jam_teams
                    if jam_team._parent_jam.id.period == max_period_num
                ],
                key=lambda jam_team: jam_team._parent_jam.id.jam,
            )
            self._most_recent_jam = ref(jam)
        return sum([trip.points for trip in jam.trips]) if jam is not None else 0

    def period_score(self, period: int) -> int:
        return sum(
            [
                trip.points
                for jam_team in self._jam_teams
                if jam_team._parent_jam.id.period == period
                for trip in jam_team.trips
            ]
        )
