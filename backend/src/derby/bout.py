from typing import Any, Hashable
from server import Queryable


class Bout(Queryable):
    def __init__(self, key: Hashable) -> None:
        super().__init__(key)

    def get(self) -> dict[str | float | int, Any]:
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
                'intermission': None,
                'period': None,
                'lineup': None,
                'jam': None,
                'timeout': None
            },  # TODO
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
                }
            },
            'jams': {
                'score': {
                    'home': 0,  # TODO
                    'away': 0   # TODO
                },
                'counts': [0, 0],  # TODO
            },
            'penalties': None  # TODO
        }
