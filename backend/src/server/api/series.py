from .bout import getBout
from roller_derby import Bout, BoutId, bouts, Series, Timer
from typing import Any
import server


@server.getter(Series)
def getSeries() -> list[dict[str, Any]]:
    return [getBout(id) for id in bouts]


@server.register
def addBout() -> None:
    new_bout_id: BoutId = bouts.add()
    bout: Bout = bouts[new_bout_id]

    resource_id: server.resource_id = {
        'name': type(bout),
        'boutId': str(new_bout_id)
    }

    # Ensure the server broadcasts updates whenever a Timer has elapsed
    for clock_name in ('intermission', 'period', 'lineup', 'jam', 'timeout'):
        clock: Timer = getattr(bout, f'{clock_name}_clock')
        clock.set_callback(lambda _: server.queue_update(resource_id,
                                                         send_now=True))

    server.queue_update(resource_id)


@server.register
def deleteBout(boutId: BoutId) -> None:
    bouts.delete(boutId)
    server.queue_update({'name': Bout, 'boutId': str(boutId)})
