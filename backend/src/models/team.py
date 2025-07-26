from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import (
    ForeignKey,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from models.models import SQLModel

if TYPE_CHECKING:
    from models.bout import BoutModel, TimeoutModel
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

    bout: Mapped[BoutModel] = relationship(back_populates='teams', init=False)
    roster: Mapped[RosterModel] = relationship(foreign_keys=[_roster_id])

    timeouts_remaining: Mapped[int] = mapped_column()
    reviews_remaining: Mapped[int] = mapped_column()
    score_offset: Mapped[int] = mapped_column(default=0, init=False)

    timeouts: Mapped[list[TimeoutModel]] = relationship(
        back_populates='team', init=False
    )
    team_jams: Mapped[list[TeamJamModel]] = relationship(init=False)
