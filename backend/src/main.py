import asyncio
import server


if __name__ == '__main__':
    import roller_derby
    roller_derby.bouts.add()

    asyncio.run(server.serve())
