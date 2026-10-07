"""Pydantic Bout schemas."""

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Annotated
from uuid import UUID

from core.app import ServerSchema, register_model, timedelta_serializer
from game.bouts.models import BaseBout
from game.jams.models import Jam
from game.schemas import ClockSchema
from game.skaters.schemas import SkaterSchema
from game.timeouts.models import Timeout
from pydantic import Field, SkipValidation, computed_field

from .types import BoutStateStr, BoutSubStateStr


@dataclass
class JamUri:
    """A utility dataclass to represent the Jam head in the BoutSchema."""

    period_num: int
    jam_num: int


class RulesetSchema(ServerSchema):
    """Represent a Ruleset as a JSON schema.

    The Ruleset differs from other schemas in this module in that it is only
    representable as a schema; there is no Ruleset model. This is because Rulesets are
    stored as constants which do not need to be written to file.
    """

    def __hash__(self) -> int:
        """Hash this schema.

        Returns:
            int: this schema's hash.

        """
        return hash(self.name)

    name: str
    num_periods: int
    jam_duration: Annotated[timedelta, timedelta_serializer]
    lineup_duration: Annotated[timedelta, timedelta_serializer]
    points_per_trip: int
    num_timeouts: int
    num_reviews: int


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


@register_model(BaseBout)
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
    jams: Annotated[list[Jam], SkipValidation] = Field(exclude=True)
    timeouts: Annotated[list[Timeout], SkipValidation] = Field(exclude=True)

    @computed_field
    @property
    def jam_uuids(self) -> tuple[list[UUID], list[UUID], list[UUID]]:
        """A tuple listing all the Jams in this Bout, by period.

        Returns:
            tuple[list[UUID], list[UUID], list[UUID]]: the Jam UUIDs.

        """
        uuids: tuple[list[UUID], list[UUID], list[UUID]] = [], [], []
        for jam in self.jams:
            uuids[jam.period].append(jam.uuid)
        return uuids

    @computed_field
    @property
    def timeout_uuids(self) -> tuple[UUID, ...]:
        """Get the UUIDs of the Timeouts that have been called in this Bout.

        Returns:
            list[UUID]: the UUIDs of the Timeouts that have been called.

        """
        return tuple(
            timeout.uuid for timeout in self.timeouts if isinstance(timeout.uuid, UUID)
        )

    @computed_field
    @property
    def active_jam_uuid(self) -> UUID:
        """Get the UUID of the active Jam.

        The UUID of the first Jam is returned if there is no active Jam.

        Returns:
            UUID: The UUID of the active Jam.

        """
        period_num: int = self.jams[-1].period
        if self.state == 'stopped' and period_num > 0:
            period_num -= 1  # Haven't started the next Period yet

        jam_num: int = 0
        for jam in reversed([jam for jam in self.jams if jam.period == period_num]):
            if jam.start_timestamp is not None:
                jam_num = jam.num
                break

        return self.jam_uuids[period_num][jam_num]
