from __future__ import annotations

from pydantic import Field

from schemas.bout import BoutSchema
from schemas.jam import TeamJamSchema
from schemas.schemas import ServerSchema


class RosterSchema(ServerSchema):
    pass
    # TODO: mnemonic: str
    # TODO: league
    # TODO: color
    # TODO: skaters: list[Skater]


class TeamSchema(ServerSchema):
    # bout: Mapped[BoutModel] = relationship(back_populates='teams', init=False)
    # roster: Mapped[RosterModel] = relationship(foreign_keys=[_roster_id])

    timeouts_remaining: int
    reviews_remaining: int
    score_offset: int

    team_jams: list[TeamJamSchema] = Field(exclude=True)
    bout: BoutSchema = Field(exclude=True)

    # timeouts: Mapped[list[TimeoutModel]] = relationship(
    #     back_populates='team', init=False
    # )
    # team_jams: Mapped[list[TeamJamModel]] = relationship(init=False)
