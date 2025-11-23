from __future__ import annotations

from models import CHILD_RELATIONSHIP, PARENT_RELATIONSHIP, BaseSQLModel
from sqlalchemy import ForeignKey, column
from sqlalchemy.orm import Mapped, mapped_column, relationship


class Skater(BaseSQLModel):
    roster_id: Mapped[int] = mapped_column(ForeignKey('rosters.id'))
    name: Mapped[str] = mapped_column()
    pronouns: Mapped[str] = mapped_column()  # TODO: Implement pronouns
    number: Mapped[str] = mapped_column()

    roster: Mapped[Roster] = relationship(
        back_populates='skaters',
        cascade=PARENT_RELATIONSHIP,
        foreign_keys=roster_id,
        lazy='selectin',
    )

    __table_name__: str = 'skaters'

    def __init__(self, name: str, number: str) -> None:
        super().__init__(name=name, number=number)


class Roster(BaseSQLModel):
    name: Mapped[str] = mapped_column()
    league: Mapped[str] = mapped_column()
    mnemonic: Mapped[str] = mapped_column()

    skaters: Mapped[list[Skater]] = relationship(
        back_populates='roster',
        cascade=CHILD_RELATIONSHIP,
        lazy='selectin',
        order_by=[column('number')],
    )

    __tablename__: str = 'rosters'

    def __init__(self, name: str, league: str, mnemonic: str = '') -> None:
        name = name.strip()
        if name == '':
            raise ValueError('Team name cannot be blank')
        mnemonic = mnemonic.strip()
        if mnemonic == '':
            pass  # TODO: Implement team name mnemonic algorithm
        super().__init__(name=name, league=league, mnemonic=mnemonic)
