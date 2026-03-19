"""Types pertaining to Jams."""

from typing import Literal

# A union of reasons that a Jam could be stopped.
type StopReasonStr = Literal['called', 'elapsed', 'injury', 'other']
