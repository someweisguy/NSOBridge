from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import (
    ForeignKey,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.models import SQLModel

if TYPE_CHECKING:
    from models.bout import TimeoutModel
    from models.jam import TeamJamModel


class RosterModel(SQLModel):
    __tablename__ = 'rosters'
    # TODO: mnemonic: str
    # TODO: league
    # TODO: color
    # TODO: skaters: list[Skater]


class TeamModel(SQLModel):
    __tablename__ = 'teams'
    _bout_id: Mapped[int] = mapped_column(ForeignKey('bouts._id'), init=False)
    _roster_id: Mapped[int] = mapped_column(ForeignKey('rosters._id'), init=False)

    roster: Mapped[RosterModel] = relationship(foreign_keys=[_roster_id], lazy='joined')

    timeouts_remaining: Mapped[int] = mapped_column()
    reviews_remaining: Mapped[int] = mapped_column()
    score_offset: Mapped[int] = mapped_column(default=0, init=False)

    timeouts: Mapped[list[TimeoutModel]] = relationship(
        back_populates='team', init=False, lazy='selectin'
    )
    team_jams: Mapped[list[TeamJamModel]] = relationship(
        back_populates='team', init=False, lazy='selectin'
    )

    # TODO
    # @property
    # def score(self) -> int:
    #     return sum(
    #         trip.passes
    #         for team_jam in self.team_jams
    #         for trip in team_jam.trips[1:]  # The first Trip is ignored
    #     )
