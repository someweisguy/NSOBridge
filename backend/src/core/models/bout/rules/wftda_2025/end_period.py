from datetime import datetime
from typing import Iterable

from core.models import ModelKey, ProjectModel
from core.models.bout.bout import Bout


class EndPeriod(ProjectModel):
    def __call__(self, bout: Bout, timestamp: datetime) -> Iterable[ModelKey]:
        pass  # TODO

        return []  # TODO
