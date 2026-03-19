"""Types that are used in Bouts."""

from typing import Literal

# The various states that a Bout could be.
type BoutStateStr = Literal['final', 'jam', 'lineup', 'stopped', 'timeout']
