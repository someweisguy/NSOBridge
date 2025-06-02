from typing import Literal

from pydantic import Field

from model.project import ProjectModel

type TeamString = Literal['home', 'away']
type TeamOfficialString = TeamString | Literal['official']


class TeamAttribute[T](ProjectModel):
    home: T
    away: T

    def __getitem__(self, key: TeamString) -> T:
        if key not in {'home', 'away'}:
            raise KeyError(f'Invalid Team key: {key}')
        return getattr(self, key)


class Team(ProjectModel):
    class ClockStops(ProjectModel):
        timeout: int = 3
        review: int = 1

        def __getitem__(self, key: Literal['timeout', 'review']) -> int:
            return self.timeout if key == 'timeout' else self.review

    name: str = ''
    mnemonic: str = ''
    clock_stops: ClockStops = Field(default_factory=ClockStops)
