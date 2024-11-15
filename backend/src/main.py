from derby import Series
import asyncio
import server


if __name__ == '__main__':
    server.controller.data = Series()
    asyncio.run(
        server.serve()
    )
