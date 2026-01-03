"""Base exceptions."""


class ClientError(Exception):
    """The base exception for client errors.

    This exception should be thrown when an error originating from client input occurs.
    These types of exception should almost always be recoverable.
    """

    def __init__(self, message: str, description: str, *, status_code: int) -> None:
        """Initialize the exception, providing an optional status code."""
        super().__init__(message)
        self.description: str = description
        self.status_code: int = status_code


class ChainedClientError(Exception):
    """The base exception for client errors.

    This exception should be thrown when an error originating from client input occurs.
    These types of exception should almost always be recoverable.
    """

    def __init__(self, message: str, *, status_code: int) -> None:
        """Initialize the exception, providing an optional status code."""
        super().__init__(message)
        self.status_code: int = status_code
