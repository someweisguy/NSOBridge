"""Pytest test configuration."""

import pytest


def pytest_addoption(parser: pytest.Parser):
    """Add the git tag name to tests.

    Args:
        parser (pytest.Parser): a parser used by pytest to parse command line args.

    """
    parser.addoption('--tag-name', help='The tag name of the specified release')
