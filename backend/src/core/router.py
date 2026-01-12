"""Core FastAPI routes."""

import logging
from pathlib import Path
from typing import Final

from fastapi import APIRouter, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .schemas import VersionSchema
from .utils import get_resource_path

PAGES_TAG = 'Pages'
METADATA_TAG = 'Metadata'

frontend_dir: Final[Path] = get_resource_path('www')
assets = StaticFiles(directory=frontend_dir / 'assets')


pages_router: Final[APIRouter] = APIRouter(prefix='')
api_router: Final[APIRouter] = APIRouter(prefix='')


@pages_router.get('/', tags=[PAGES_TAG], name='Render Index Page')
async def _render_index() -> FileResponse:
    """Render the index page."""
    page_path_name: str = 'index.html'
    logging.info(f'Serving "{page_path_name}"')
    return FileResponse(frontend_dir / page_path_name)


@pages_router.get('/{file_name}')
@pages_router.get('/sb', tags=[PAGES_TAG], name='Render Scoreboard page')
async def _render_generic_asset(file_name: str, request: Request) -> FileResponse:
    # Render generic HTML files found in the frontend directory
    # Don't forget to register new pages with the FastAPI pages router!
    if not Path(file_name).suffix:
        file_name += '.html'

    logging.info(f'Serving "{file_name}"')
    return FileResponse(frontend_dir / file_name)


@api_router.get('/version', tags=[METADATA_TAG])
async def _get_app_version(request: Request) -> VersionSchema:
    """Return the current version of the app."""
    return VersionSchema(version=request.app.version)
