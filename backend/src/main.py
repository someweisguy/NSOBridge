from derby import Series
import asyncio
import server


if __name__ == '__main__':
    series: Series = Series()
    series.add_bout()
    server.controller.set_model(series)
    asyncio.run(server.serve())
