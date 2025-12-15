from datetime import datetime, timedelta  # noqa: TC003

from schemas import ServerSchema


class TimeoutSchema(ServerSchema):
    id: int
    bout_id: int
    team_id: int | None
    jam_id: int | None

    start_timestamp: datetime | None
    stop_timestamp: datetime | None
    clock_elapsed: timedelta

    team_is_officials: bool
    is_review: bool
    details: str
    result: str
    retained: bool
