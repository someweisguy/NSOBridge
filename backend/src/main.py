from datetime import datetime
from roller_derby import Bout, BoutId, bouts, Jam, Series, Timer
from typing import Any
import asyncio
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


@server.getter(Bout)
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


@server.getter(Jam)
def getJam(boutId: BoutId, periodId: int, jamId: int) -> dict[str, Any]:
    jam: Jam = bouts[boutId].jams[periodId][jamId]

    def encode_team(t: Jam.Team) -> dict[str, Any]:
        return {
            'lead': t.lead,
            'lost': t.lost,
            'starPass': t.star_pass,
            'trips': [{
                'timestamp': str(trip.timestamp),
                'points': trip.points
            } for trip in t.trips],
            'jammer': None,  # TODO
            'blockers': [None, None, None, None],  # TODO
            'noPivot': False,  # TODO
        }

    return {
        'startTimestamp': (str(jam.start) if jam.start is not None
                           else None),
        'stopTimestamp': (str(jam.stop) if jam.stop is not None
                          else None),
        'stopReason': jam.stop_reason,
        'home': encode_team(jam.home),
        'away': encode_team(jam.away)
    }


if __name__ == '__main__':
    addBout()
    asyncio.run(server.serve(debug=True))
