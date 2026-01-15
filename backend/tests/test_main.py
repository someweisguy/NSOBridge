"""Main tests."""

import pytest
from fastapi.testclient import TestClient
from semver import VersionInfo
from src.main import app

client = TestClient(app)


def test_app_version_is_semver():
    """Ensures that the app version is a valid SemVer string."""
    assert VersionInfo.is_valid(app.version)


def test_app_version_matches_tag(request: pytest.FixtureRequest):
    """Ensure that the git tag name matches the app version.

    Git tag names should begin with a single, lowercase 'v' and be followed by a semver
    identifier.

    Args:
        request (pytest.FixtureRequest): the request to run pytest. Must contain the git
        tag name as '--tag-name' or this test will be skipped.

    """
    git_tag_name: str | None = request.config.getoption('--tag-name', None)
    if git_tag_name is None:
        pytest.skip('A git tag name was not provided')
    assert git_tag_name.startswith('v')
    git_tag_name = git_tag_name[1:]
    assert VersionInfo.is_valid(git_tag_name)
    assert git_tag_name == str(app.version)
