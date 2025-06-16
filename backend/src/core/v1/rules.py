from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import TYPE_CHECKING

from core import updater

if TYPE_CHECKING:
    from models.bout import Bout, TeamString, bouts


@dataclass(slots=True)
class AbstractRule(ABC):
    @abstractmethod
    def __call__(self) -> None:
        raise NotImplementedError('This rule has not been implemented')

    @property
    def update_keys(self):
        return []


@dataclass(slots=True)
class AbstractBoutRule(AbstractRule):
    bout_id: str

    @property
    def update_keys(self):
        return [updater.kf.bout(self.bout.id)]

    @property
    def bout(self) -> Bout:
        return bouts[self.bout_id]


@dataclass(slots=True)
class AbstractTeamRule(AbstractRule):
    team: TeamString


@dataclass(slots=True)
class AbstractJamRule(AbstractRule):
    period_num: int
    jam_num: int

    @property
    def update_keys(self):
        return [
            updater.kf.bout(self.bout.id),
            updater.kf.jam(self.bout.id, self.period_num, self.jam_num),
        ]
