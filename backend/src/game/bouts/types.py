"""Types that are used in Bouts."""

from typing import Literal

# The various states that a Bout could be.
type BoutStateStr = Literal['final', 'jam', 'lineup', 'stopped', 'timeout']

type BoutSubStateStr = Literal[
    'lineup',
    'post-review',
    'post-timeout',
    'timeout',
    'review',
    'team-timeout',
    'official-timeout',
    'pregame',
    'halftime',
    'unofficial',
    'jam',
    'final',
]
