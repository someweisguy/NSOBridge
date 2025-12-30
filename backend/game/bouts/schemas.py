"""Pydantic Bout schemas."""

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
    """Represent a Bout as a JSON schema."""

    id: int
    series_id: int
    ruleset_name: str
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
        """Get a list of lists representing the IDs of this Bout's Jams.

        Returns:
            list[list[int]]: the Jam IDs of this Bout's Jams. Each list represents a
            Period such that a specific Jam may be queried using
            `bout.jam_ids[period_num][jam_num]`.

        """
        jam_ids: list[list[int]] = [[], [], []]
        for jam in self.jams:
            assert jam.num == len(jam_ids[jam.period])
            jam_ids[jam.period].append(jam.id)
        return jam_ids

    @computed_field
    @property
    def timeout_ids(self) -> list[int]:
        """Get a list representing the IDs of this Bout's Timeouts.

        Returns:
            list[int]: the Timeout IDs of this Bout's Timeouts.

        """
        return [timeout.id for timeout in self.timeouts]
