"""Pydantic Timeout schemas."""

from datetime import datetime, timedelta  # noqa: TC003
from typing import Annotated
from uuid import UUID

from core import ServerSchema, timedelta_serializer
from game.teams.schemas import TeamSchema
from pydantic import Field, computed_field


class TimeoutSchema(ServerSchema):
    """Represent a Timeout as a JSON schema."""

    bout_uuid: UUID
    num: int

    team: TeamSchema | None = Field(exclude=True)
    # FIXME: add period num and jam num, if any

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
    def team_num(self) -> int | None:
        """Get the Team number of the Team that called this Timeout, if any.

        Returns:
            int | None: the Team number of the calling Team or None if not yet
            determined.

        """
        if self.team is None:
            return None
        return self.team.num
