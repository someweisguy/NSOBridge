from __future__ import annotations

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

    bout_score: int
    jam_score: int
    timeouts_remaining: int
    reviews_remaining: int
    score_offset: int

    # timeouts: Mapped[list[TimeoutModel]] = relationship(
    #     back_populates='team', init=False
    # )
    # team_jams: Mapped[list[TeamJamModel]] = relationship(init=False, lazy='selectin')
