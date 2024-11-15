from derby import Series
import asyncio
import server


if __name__ == '__main__':
    series: Series = Series()
    server.controller.data = series
    asyncio.run(
        server.serve()
    )
