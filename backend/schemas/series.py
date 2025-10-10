from __future__ import annotations

from datetime import datetime  # noqa: TC003

from pydantic import Field, computed_field

from .schemas import ServerSchema


class JamSchema(ServerSchema):
    start_timestamp: datetime | None
    period: int
    jam: int


class RosterSchema(ServerSchema):
    name: str


class TeamSchema(ServerSchema):
    id: int
    roster: RosterSchema = Field(exclude=True)
    bout_score: int
    jam_score: int
    score_offset: int

    @computed_field
    @property
    def name(self) -> str:
        return self.roster.name


class BoutSchema(ServerSchema):
    id: int
    ruleset: str
    is_running: bool = Field(exclude=True)
    is_final: bool
    teams: list[TeamSchema]
    jams: list[JamSchema] = Field(exclude=True)

    def _active_jam(self) -> JamSchema | None:
        num_jams: int = len(self.jams)
        if num_jams == 0 or not self.is_running:
            return None

        if num_jams == 1:
            return self.jams[0]
        jam: JamSchema = self.jams[-1]
        if jam.start_timestamp is None and jam.period == self.jams[-2].period:
            # Only show the active Jam in the current Period
            jam = self.jams[-2]
        return jam

    @computed_field
    @property
    def period(self) -> int:
        jam: JamSchema | None = self._active_jam()
        return jam.period if jam is not None else 0

    @computed_field
    @property
    def jam(self) -> int:
        jam: JamSchema | None = self._active_jam()
        return jam.jam if jam is not None else 0


class SeriesSchema(ServerSchema):
    name: str
    bouts: list[BoutSchema]
