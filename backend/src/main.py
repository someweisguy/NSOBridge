import asyncio
import server
import roller_derby


if __name__ == '__main__':
    roller_derby.bouts.add()

    import api
    server.set_adapter(api.adapter)

    asyncio.run(server.serve())
