"""Pydantic Ruleset schemas."""

from dataclasses import dataclass
from datetime import timedelta
from typing import Annotated

from core import ServerSchema, timedelta_serializer


@dataclass(frozen=True)
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
