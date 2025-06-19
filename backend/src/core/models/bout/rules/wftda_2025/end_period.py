from datetime import datetime

from core.models import Gettable, ProjectModel
from core.models.bout.bout import Bout


class EndPeriod(ProjectModel):
    def __call__(self, bout: Bout, timestamp: datetime) -> tuple[Gettable, ...]:
        pass  # TODO

        return ()  # TODO
