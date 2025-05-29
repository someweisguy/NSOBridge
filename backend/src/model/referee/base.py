from abc import ABC
from dataclasses import dataclass
from typing import Final

from model.context import RefereeContext


@dataclass(slots=True)
class AbstractReferee(ABC):
    context: Final[RefereeContext]
    
    def setup(self) -> None:  # noqa: B027
        pass
    
