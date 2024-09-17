from __future__ import annotations
from copy import copy
from datetime import datetime
from roller_derby.clocks import Clocks
from roller_derby.interface import Copyable, Resource
from roller_derby.jam import Periods
from typing import Any


class Bout(Resource, Copyable):
    __slots__ = '_id', '_clocks', '_jams'

    def __init__(self) -> None:
        self._clocks: Clocks = Clocks()
        self._jams: Periods = Periods()

    @property
    def clocks(self) -> Clocks:
        return self._clocks

    @property
    def jams(self) -> Periods:
        return self._jams

    def __copy__(self) -> Bout:
        # FIXME
        snapshot: Bout = Bout()
        snapshot._clocks = copy(self._clocks)
        snapshot._jams = copy(self._jams)
        return snapshot

    def serve(self, timestamp: datetime | None = None) -> dict[str, Any]:
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
            'clocks': self.clocks.serve(timestamp),
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
                'jamCounts': [len(period) for period in self.jams],
            },
            'penalties': None  # TODO
        }
