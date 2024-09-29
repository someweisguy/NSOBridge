import asyncio
import server


if __name__ == '__main__':
    import roller_derby
    roller_derby.bouts.add()

    import api
    server.set_adapter(api.adapter)
    server.register(api.adapter, 'get')

    asyncio.run(server.serve())
