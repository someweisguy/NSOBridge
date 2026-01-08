"""Main tests."""

from fastapi.testclient import TestClient
from semver import VersionInfo
from src.main import app

client = TestClient(app)


def test_app_version_is_semver():
    """Ensures that the app version is a valid SemVer string."""
    assert VersionInfo.is_valid(app.version)
