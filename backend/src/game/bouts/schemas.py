"""Pydantic Bout schemas."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta  # noqa: TC003
from typing import Annotated
from uuid import UUID  # noqa: TC003

from core.app import ServerSchema, timedelta_serializer
from game.jams.schemas import JamSchema  # noqa: TC002
from game.schemas import ClockSchema  # noqa: TC002
from game.skaters.schemas import SkaterSchema  # noqa: TC002
from game.timeouts.schemas import TimeoutSchema  # noqa: TC002
from pydantic import Field, SkipValidation, computed_field

from .types import BoutStateStr, BoutSubStateStr  # noqa: TC001


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
    state: BoutStateStr
    sub_state: BoutSubStateStr
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
        """A URI representing the current or most recently played Jam.

        This Jam URI is sticky on Period thresholds. This is to ensure that the active
        Jam URI is always the active Jam of the current Period.
        """
        period_num: int = self.jams[-1].period
        if self.state == 'stopped' and period_num > 0:
            period_num -= 1  # Haven't started the next Period yet

        jam_num: int = 0
        for jam in reversed([jam for jam in self.jams if jam.period == period_num]):
            if jam.start_timestamp is not None:
                jam_num = jam.num
                break

        return JamUri(period_num, jam_num)

    @computed_field
    @property
    def timeout_count(self) -> int:
        """Get the number of Timeouts in this Bout.

        Returns:
            list[int]: the number of timeouts in this Bout.

        """
        return len(self.timeouts)


class TeamSchema(ServerSchema):
    """Represent a Team as a JSON schema."""

    name: str
    league: str
    mnemonic: str
    num: int
    bout_score: int
    jam_score: int
    timeouts_remaining: int
    reviews_remaining: int
    score_offset: int
    skaters: list[SkaterSchema]


class Ruleset(ServerSchema):
    """Represent a Ruleset as a JSON schema.

    The Ruleset differs from other schemas in this module in that it is only
    representable as a schema; there is no Ruleset model. This is because Rulesets are
    stored as constants which do not need to be written to file.
    """

    name: str
    num_periods: int
    jam_duration: Annotated[timedelta, timedelta_serializer]
    lineup_duration: Annotated[timedelta, timedelta_serializer]
    points_per_trip: int
    num_timeouts: int
    num_reviews: int
