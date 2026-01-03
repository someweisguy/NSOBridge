"""Exceptions needed for rulesets."""

from http import HTTPStatus

from core.exceptions import ClientError


class GameError(ClientError):
    """The base exception for game-related errors."""

    pass


class GameStateError(GameError):
    """An exception stemming from the state of the game."""

    def __init__(self, description: str) -> None:
        """Initialize a GameStateError.

        Args:
            description (str): A descriptive reason for the error.

        """
        super().__init__(
            'Invalid game state', description, status_code=HTTPStatus.CONFLICT
        )


class RulesError(GameError):
    """An exception stemming from the ruleset of the game."""

    def __init__(self, description: str) -> None:
        """Initialize a RulesError.

        Args:
            description (str): A descriptive reason for the error.

        """
        super().__init__(
            'Rules violation', description, status_code=HTTPStatus.CONFLICT
        )
