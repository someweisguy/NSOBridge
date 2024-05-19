import server

@server.register
def addTrip(tick: int, points: int):
    print("added trip")

if __name__ == "__main__":
    import asyncio
    
    asyncio.run(server.serve(8000, debug=True))