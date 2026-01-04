"""Core FastAPI routes."""

import logging
from pathlib import Path
from typing import Final

from fastapi import APIRouter, Request
from fastapi.responses import FileResponse

FRONTEND: Final[Path] = Path.cwd() / Path('dist')

PAGES_TAG = 'Pages'

pages_router: Final[APIRouter] = APIRouter(prefix='/')
api_router: Final[APIRouter] = APIRouter(prefix='/api')


@pages_router.get('/', tags=[PAGES_TAG], name='Render Index Page')
async def _render_index() -> FileResponse:
    """Render the index page."""
    page_path_name: str = 'index.html'
    logging.info(f'Serving "{page_path_name}"')
    return FileResponse(FRONTEND / page_path_name)


@pages_router.get('/sb', tags=[PAGES_TAG], name='Render Scoreboard page')
async def _render_generic(request: Request) -> FileResponse:
    # Render generic HTML files found in the frontend directory.
    page_path_name: str = request.url.path[1:] + '.html'
    logging.info(f'Serving "{page_path_name}"')
    return FileResponse(FRONTEND / page_path_name)
