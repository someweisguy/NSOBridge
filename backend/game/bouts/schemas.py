from __future__ import annotations

from datetime import datetime  # noqa: TC003
from typing import Literal  # noqa: TC003

from core import ServerSchema
from game.clocks.schemas import ClockSchema  # noqa: TC002
from game.jams.schemas import JamSchema  # noqa: TC002
from game.teams.schemas import TeamSchema  # noqa: TC002
from game.timeouts.schemas import TimeoutSchema  # noqa: TC002
from pydantic import Field, computed_field


class BoutSchema(ServerSchema):
    id: int
    series_id: int
    ruleset: str
    clock: ClockSchema
    is_running: bool
    start_countdown: datetime | None
    is_final: bool
    state: Literal['final', 'jam', 'lineup', 'stopped', 'timeout']
    teams: list[TeamSchema]
    jams: list[JamSchema] = Field(exclude=True)
    timeouts: list[TimeoutSchema] = Field(exclude=True)

    @computed_field
    @property
    def jam_ids(self) -> list[list[int]]:
        jam_ids: list[list[int]] = [[], [], []]
        for jam in self.jams:
            assert jam.num == len(jam_ids[jam.period])
            jam_ids[jam.period].append(jam.id)
        return jam_ids

    @computed_field
    @property
    def timeout_ids(self) -> list[int]:
        return [timeout.id for timeout in self.timeouts]
