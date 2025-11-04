from __future__ import annotations

from typing import TYPE_CHECKING, override

from core.database import SQLModel
from sqlalchemy import (
    ForeignKey,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from .bout import GenericBoutModel
    from .jam import TeamJamModel
    from .time import TimeoutModel


class RosterModel(SQLModel):
    __tablename__: str = 'rosters'

    name: Mapped[str] = mapped_column()
    # TODO: mnemonic: str
    # TODO: league
    # TODO: color
    # TODO: skaters: list[Skater]

    def __init__(self, name: str) -> None:
        name = name.strip()
        if name == '':
            raise ValueError('Team name cannot be blank')
        super().__init__(name=name)

    @property
    @override
    def parents(self) -> tuple[SQLModel, ...]:  # TODO: does this need to be None?
        return ()  # TODO


class TeamModel(SQLModel):
    __tablename__: str = 'teams'

    _bout_id: Mapped[int] = mapped_column(ForeignKey('bouts.id'))
    _roster_id: Mapped[int] = mapped_column(ForeignKey('rosters.id'))
    reviews_remaining: Mapped[int] = mapped_column()
    score_offset: Mapped[int] = mapped_column(default=0)
    timeouts_remaining: Mapped[int] = mapped_column()

    bout: Mapped[GenericBoutModel | None] = relationship()
    roster: Mapped[RosterModel | None] = relationship(
        cascade='all', foreign_keys=[_roster_id], lazy='joined'
    )
    team_jams: Mapped[list[TeamJamModel]] = relationship(
        back_populates='team', cascade='all', lazy='selectin'
    )
    timeouts: Mapped[list[TimeoutModel]] = relationship(
        back_populates='team', cascade='all', lazy='selectin'
    )

    def __init__(self, roster: RosterModel):
        super().__init__(roster=roster)

    @property
    @override
    def parents(self) -> tuple[SQLModel | None, ...]:
        return (self.bout,)

    @property
    def bout_score(self) -> int:
        if self.bout is None:
            return 0
        return self.bout.fetch_team_bout_score(self)

    @property
    def jam_score(self) -> int:
        if self.bout is None:
            return 0
        return self.bout.fetch_team_jam_score(self)
