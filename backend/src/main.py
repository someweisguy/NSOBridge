from datetime import datetime
from roller_derby import Bout, BoutId, bouts, Jam, Timer
from typing import Any
import asyncio
import server


@server.register
def getSeries() -> list[dict[str, Any]]:
    return [getBout(id) for id in bouts]


@server.register
def addBout() -> None:
    new_bout_id: BoutId = BoutId()
    bout: Bout = bouts[new_bout_id]

    def default_clock_callback(_: datetime) -> None:
        server.queue_update((new_bout_id, ), bout)
        server.broadcast_updates()

    # Ensure the server broadcasts updates whenever a Timer has elapsed
    for clock_name in ('intermission', 'period', 'lineup', 'jam', 'timeout'):
        clock: Timer = getattr(bout, f'{clock_name}_clock')
        clock.set_callback(default_clock_callback)

    server.queue_update((new_bout_id,), bout)


@server.register
def deleteBout(boutId: BoutId) -> None:
    bouts.delete(boutId)
    server.queue_update((boutId,), None)


@server.register
def getBout(boutId: BoutId) -> dict[str, Any]:
    bout: Bout = bouts[boutId]
    now: datetime = datetime.now()

    def encode_timer(t: Timer) -> dict[str, int | bool | None]:
        return {
            'elapsed': round(t.get_elapsed(now).total_seconds() * 1000),
            'alarm': (round(t.alarm.total_seconds() * 1000)
                      if t.alarm is not None else None),
            'isRunning': t.is_running()
        }

    return {
        'info': {
            'venue': None,
            'gameNumber': None,
            'date': None
        },  # TODO
        'roster': {
            'home': None,
            'away': None
        },  # TODO
        'clocks': {
            'intermission': encode_timer(bout.intermission_clock),
            'period': encode_timer(bout.period_clock),
            'lineup': encode_timer(bout.lineup_clock),
            'jam': encode_timer(bout.jam_clock),
            'timeout': encode_timer(bout.timeout_clock)
        },
        'timeouts': {
            'remaining': {
                'home': {
                    'timeouts': 0,  # TODO
                    'officialReviews': 0  # TODO
                },
                'away': {
                    'timeouts': 0,  # TODO
                    'officialReviews': 0  # TODO
                }
            },
            'ongoing': {
                'isOfficialReview': False,  # TODO
                'caller': None,  # TODO
                'isRetained': False,  # TODO
                'notes': ''  # TODO
            }
        },
        'jams': {
            'score': {
                'home': 0,  # TODO
                'away': 0   # TODO
            },
            'jamCounts': [len(period) for period in bout.jams],
        },
        'penalties': None  # TODO
    }


@server.register
def getJam(boutId: BoutId, periodId: int, jamId: int) -> Jam:
    return bouts[boutId].jams[periodId][jamId]


if __name__ == '__main__':
    addBout()
    asyncio.run(server.serve())
