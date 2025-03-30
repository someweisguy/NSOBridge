import logging
import asyncio
import server

from controller import Controller
from model import Model


if __name__ == '__main__':
    Controller(Model())
    
    asyncio.run(server.serve())
    
    
