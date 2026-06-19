"""Constants used in the core application."""

from math import floor

from pydantic import PlainSerializer

timedelta_serializer = PlainSerializer(lambda td: floor(td.total_seconds() * 1000))

tags_metadata: list[dict[str, str]] = [
    {
        'name': 'Series',
        'description': 'A sequence of Bouts, such as a double-header or a tournament.',
    },
    {
        'name': 'Rosters',
        'description': 'Roster management',
    },
    {
        'name': 'Bouts',
        'description': 'Bout and bout state controls',
    },
    {
        'name': 'Jams',
        'description': 'Manage ',
    },
    {
        'name': 'Timeouts',
        'description': 'Manage items. So _fancy_ they have their own docs.',
    },
    {
        'name': 'History',
        'description': 'User history commands',
    },
    {
        'name': 'Pages',
        'description': 'Endpoints that render HTML.',
    },
]
