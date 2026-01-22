"""Pydantic Bout schemas."""

from __future__ import annotations

from datetime import datetime  # noqa: TC003
from typing import Literal  # noqa: TC003
from uuid import UUID  # noqa: TC003

from core import ServerSchema
from game.clocks.schemas import ClockSchema  # noqa: TC002
from game.jams.schemas import JamSchema  # noqa: TC002
from game.teams.schemas import TeamSchema  # noqa: TC002
from game.timeouts.schemas import TimeoutSchema  # noqa: TC002
from pydantic import Field, computed_field


class BoutSchema(ServerSchema):
    """Represent a Bout as a JSON schema."""

    uuid: UUID
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
    def jam_counts(self) -> tuple[int, int, int]:
        """Get a list of lists representing the IDs of this Bout's Jams.

        Returns:
            list[list[int]]: the Jam IDs of this Bout's Jams. Each list represents a
            Period such that a specific Jam may be queried using
            `bout.jam_ids[period_num][jam_num]`.

        """
        counts: dict[int, int] = {}
        for jam in self.jams:
            counts[jam.period] = counts.get(jam.period, 0) + 1
        return counts.get(0, 0), counts.get(1, 0), counts.get(2, 0)

    @computed_field
    @property
    def timeout_counts(self) -> int:
        """Get a list representing the IDs of this Bout's Timeouts.

        Returns:
            list[int]: the Timeout IDs of this Bout's Timeouts.

        """
        return len(self.timeouts)
