from roller_derby import bouts
import asyncio
import server

if __name__ == '__main__':
    server.load_api()
    bouts.add()
    asyncio.run(server.serve())
