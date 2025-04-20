from typing import Final
from uuid import UUID

from model import bouts
from model.bout import Bout
from model.jam import Jam, JamId
from model.timer import Timer


def get_series_view() -> dict:
    view = {}
    for key, _ in bouts.items():
        view[key] = ''
    return view


def get_bout_view(bout_id: UUID) -> Bout:
    try:
        return bouts[bout_id]
    except KeyError:
        raise KeyError(f'Bout {bout_id} not found') from None


def get_jam_view(bout_id: UUID, jam_id: JamId) -> Jam:
    try:
        bout: Bout = get_bout_view(bout_id)
        return bout.get_jam(jam_id)
    except KeyError:
        raise KeyError(f'Jam {jam_id} not found in bout {bout_id}') from None


def get_timer_view(bout_id: UUID) -> Timer:
    try:
        bout: Bout = get_bout_view(bout_id)
        return bout.timer
    except KeyError:
        raise KeyError(f'Bout {bout_id} not found') from None


GETTER_REGISTRY: Final[dict[str, callable]] = {
    'series': get_series_view,
    'bout': get_bout_view,
    'jam': get_jam_view,
    'timer': get_timer_view,
}


__all__ = ('GETTER_REGISTRY',)
