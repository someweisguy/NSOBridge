"""Application log handling."""

from __future__ import annotations

import logging
import sys
from datetime import datetime
from logging import Handler, StreamHandler
from pathlib import Path
from typing import LiteralString

import colorlog

logging.getLogger('aiosqlite').setLevel(logging.CRITICAL)


def configure_logging(
    log_dir: Path | str, *, level: int | str | None, silent: bool
) -> None:
    """Configure logging for the application.

    Args:
        log_dir (Path | str): the directory in which to write log files.
        level (int | str | None): the logging level to use.
        silent (bool): False to disable logging to the console.

    """

    def _get_log_format(*, use_colors: bool = False) -> str:
        time: LiteralString = '%(asctime)s'
        level: LiteralString = '%(levelname)s'
        if use_colors:
            time = f'%(light_black)s{time}%(reset)s'
            level = f'%(bold)s%(log_color)s{level}%(reset)s'
        return f'{time} {level} %(message)s'

    datefmt: LiteralString = '%H:%M:%S'
    if not isinstance(log_dir, Path):
        log_dir = Path(log_dir)
    if not log_dir.exists():
        log_dir.mkdir()
    file: Path = log_dir / Path(f'{datetime.now().strftime("%Y-%m-%d")}.log')
    logging_handlers: list[Handler] = [logging.FileHandler(file, mode='a')]
    if not silent:
        console_logger: StreamHandler = logging.StreamHandler(sys.stdout)
        console_logger.formatter = colorlog.ColoredFormatter(
            fmt=_get_log_format(use_colors=True),
            datefmt=datefmt,
            log_colors={
                'DEBUG': 'cyan',
                'INFO': 'green',
                'WARNING': 'yellow',
                'ERROR': 'red',
                'CRITICAL': 'red,bg_white',
            },
        )
        logging_handlers.append(console_logger)
    logging.basicConfig(
        level=level,
        format=_get_log_format(use_colors=False),
        datefmt=datefmt,
        handlers=logging_handlers,
    )
