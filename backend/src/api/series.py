from . import Id
from roller_derby import Bout, BoutId, bouts, Series
from typing import Any
import server


@server.getter(Series)
def getSeries() -> dict[str, Any]:
    # TODO: return abstract of bouts
    series: dict[str, Any] = {}
    for bout_id in bouts:
        series[str(bout_id)] = {
            # TODO
        }
    return series


@server.register
def addBout() -> None:
    new_bout_id: BoutId = bouts.add()
    bout: Bout = bouts[new_bout_id]

    id: Id = Id(Bout, new_bout_id)

    # Ensure the server broadcasts updates whenever a Timer has elapsed
    for clock in (bout.intermission_clock, bout.period_clock,
                  bout.lineup_clock, bout.jam_clock, bout.timeout_clock):
        clock.set_callback(lambda _: server.queue_update(id, send_now=True))

    server.queue_update(id)


@server.register
def deleteBout(boutId: BoutId) -> None:
    bouts.delete(boutId)
    server.queue_update(Id(Bout, boutId))
