from typing import Final

from server.api import series

GETTER_REGISTRY: Final[dict[str, callable]] = {
    'series': series.get,
}
