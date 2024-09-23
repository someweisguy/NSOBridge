from datetime import datetime
from roller_derby import Bout, BoutId, bouts, Timer
from typing import Any
import server


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
