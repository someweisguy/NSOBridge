import logging
import asyncio
import server

from controller import Controller
from model import Model

logging.basicConfig(
    format='{levelname}: {message}',
    datefmt='%m/%d/%Y %H:%M:%S',
    style='{',
    level=logging.INFO,
)


if __name__ == '__main__':
    Controller(Model())
    
    asyncio.run(server.serve())
    
    
