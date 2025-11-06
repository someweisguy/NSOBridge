from __future__ import annotations

from typing import override

from core.database import SQLModel
from sqlalchemy.orm import Mapped, mapped_column


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

    @override
    def get_parents(self) -> tuple[SQLModel, ...]:  # TODO: does this need to be None?
        return ()  # TODO
