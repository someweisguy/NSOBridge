from derby.jam import Jam
from typing import Any
from server import Queryable
from uuid import UUID


class Bout(Queryable):
    def __init__(self, id: UUID) -> None:
        super().__init__(id)
        self._jams: tuple[list[Jam], list[Jam]] = ([], [])
        self.push_jam(0)  # At least 1 Jam is required

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
                'counts': [len(period) for period in self._jams],
            },
            'penalties': None  # TODO
        }

    def get_current_period_index(self) -> int:
        return int(len(self._jams[1]) > 0)
    
    def get_jam(self, jam_id: tuple[int, int]) -> Jam:
        period_index, jam_index = jam_id
        return self._jams[period_index][jam_index]
    
    def push_jam(self, period: int) -> None:
        next_jam_number: int = len(self._jams[period])
        new_jam: Jam = Jam(self.id, (period, next_jam_number))
        self._jams[period].append(new_jam)
        self.watch(new_jam)
    
    def pop_jam(self, period: int) -> Jam:
        popped_jam: Jam = self._jams[period].pop()
        self.un_watch(popped_jam)
        self.notify()
        return popped_jam
    
    