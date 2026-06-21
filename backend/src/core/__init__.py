"""Core NSO Bridge dependencies.

This file exports the core functions needed to run NSO Bridge.
"""

from .logging import configure_logging

__all__ = ('configure_logging',)
