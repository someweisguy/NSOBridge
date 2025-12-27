"""Base exceptions."""


class ClientError(Exception):
    """The base exception for client errors.

    This exception should be thrown when an error originating from client input occurs.
    These types of exception should almost always be recoverable.
    """

    pass
