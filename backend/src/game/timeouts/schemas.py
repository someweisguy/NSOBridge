"""Pydantic Timeout schemas."""

from __future__ import annotations

from datetime import datetime, timedelta  # noqa: TC003
from typing import TYPE_CHECKING, Annotated

from core.app import ServerSchema, timedelta_serializer
from pydantic import Field, SkipValidation, computed_field

if TYPE_CHECKING:
    from uuid import UUID

    from game.bouts.schemas import TeamSchema
    from game.jams.schemas import JamSchema


class TimeoutSchema(ServerSchema):
    """Represent a Timeout as a JSON schema."""

    bout_uuid: UUID
    num: int

    jam: SkipValidation[JamSchema] = Field(exclude=True)
    team: SkipValidation[TeamSchema | None] = Field(exclude=True)

    start_timestamp: datetime | None
    stop_timestamp: datetime | None
    clock_elapsed: Annotated[timedelta, timedelta_serializer] | None

    team_is_officials: bool
    is_review: bool
    details: str
    result: str
    retained: bool

    @computed_field
    @property
    def period_num(self) -> int:
        """Get the Period number of the Jam preceding this Timeout.

        Timeouts cannot be uniquely identified by their Period and Jam number because
        multiple Timeouts may be called after a single Jam.

        Returns:
            int: the Period number of the Jam preceding this Timeout.

        """
        return self.jam.period

    @computed_field
    @property
    def jam_num(self) -> int | None:
        """Get the Jam number of the Jam preceding this Timeout.

        Timeouts cannot be uniquely identified by their Period and Jam number because
        multiple Timeouts may be called after a single Jam.

        Returns:
            int: the Jam number of the Jam preceding this Timeout.

        """
        return self.jam.num

    @computed_field
    @property
    def team_num(self) -> int | None:
        """Get the Team number of the Team that called this Timeout, if any.

        Returns:
            int | None: the Team number of the calling Team or None if not yet
            determined.

        """
        if self.team is None:
            return None
        return self.team.num
