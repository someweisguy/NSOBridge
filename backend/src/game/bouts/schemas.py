"""Pydantic Bout schemas."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime  # noqa: TC003
from uuid import UUID  # noqa: TC003

from core import ServerSchema
from game.clocks.schemas import ClockSchema  # noqa: TC002
from game.jams.schemas import JamSchema  # noqa: TC002
from game.teams.schemas import TeamSchema  # noqa: TC002
from game.timeouts.schemas import TimeoutSchema  # noqa: TC002
from pydantic import Field, SkipValidation, computed_field

from .types import BoutStateStr  # noqa: TC001


@dataclass
class JamUri:
    """A utility dataclass to represent the Jam head in the BoutSchema."""

    period_num: int
    jam_num: int


class BoutSchema(ServerSchema):
    """Represent a Bout as a JSON schema."""

    uuid: UUID
    ruleset_name: str
    series_uuid: UUID | None
    clock: ClockSchema
    is_running: bool
    start_countdown: datetime | None
    is_final: bool
    state: BoutStateStr
    teams: list[TeamSchema]
    jams: list[SkipValidation[JamSchema]] = Field(exclude=True)
    timeouts: list[SkipValidation[TimeoutSchema]] = Field(exclude=True)

    @computed_field
    @property
    def jam_counts(self) -> tuple[int, int, int]:
        """A tuple representing the number of jams in this Bout per Period.

        Returns:
            tuple[int, int, int]: the number of Jams in each Period of this Bout.

        """
        counts: dict[int, int] = {}
        for jam in self.jams:
            counts[jam.period] = counts.get(jam.period, 0) + 1
        return counts.get(0, 0), counts.get(1, 0), counts.get(2, 0)

    @computed_field
    @property
    def jam_head(self) -> JamUri:
        """A tuple representing the current or most recently played Jam."""
        for jam in reversed(self.jams):
            if jam.start_timestamp is not None:
                return JamUri(jam.period, jam.num)

        return JamUri(0, 0)

    @computed_field
    @property
    def timeout_count(self) -> int:
        """Get the number of Timeouts in this Bout.

        Returns:
            list[int]: the number of timeouts in this Bout.

        """
        return len(self.timeouts)
