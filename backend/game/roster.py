from __future__ import annotations

from models import BaseSQLModel
from sqlalchemy.orm import Mapped, mapped_column


class RosterModel(BaseSQLModel):
    name: Mapped[str] = mapped_column()
    # TODO: mnemonic: str
    # TODO: league
    # TODO: color
    # TODO: skaters: list[Skater]
    
    __tablename__: str = 'rosters'

    def __init__(self, name: str) -> None:
        name = name.strip()
        if name == '':
            raise ValueError('Team name cannot be blank')
        super().__init__(name=name)
