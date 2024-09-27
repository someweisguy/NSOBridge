import asyncio
import server
import roller_derby
import api

if __name__ == '__main__':
    roller_derby.bouts.add()
    server.set_adapter(api.adapter)
    asyncio.run(server.serve())
