from derby.series import Series
from server import controller
from typing import Any


@controller.action
def getSeries() -> dict[str | float | int, Any]:
    return controller.data.get()

@controller.action
def getBout(bout_id: str) -> dict[str | float | int, Any]:
    series: Series = controller.data
    return series.get_bout(bout_id).get()