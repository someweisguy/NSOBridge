import "./socket.io.js"

export const socket = io()
var epsilon = 0;

export async function getEpsilon(iterations) {
    var sum = 0;
    var oldServerTime = 0;
    for (var i = 0; i < iterations; ++i) {
        const start = Date.now();
        oldServerTime = await socket.emitWithAck("sync");
        sum += (Date.now() - start);
    }
    const currentServerTime = oldServerTime + Math.round((sum / 2) / iterations);
    return Date.now() - currentServerTime;
}

export function getServerTime() {
    return Date.now() - epsilon;
}

socket.on("connect", async () => {
    console.log("Connected to game server");
    const iterations = 10;
    console.log("Syncing time with server using " + iterations + " iterations");
    epsilon = await getEpsilon(iterations);
    setInterval(() => {
        document.getElementById("time").innerText = getServerTime()
    }, 50);
    console.log("Time sync epsilon is " + epsilon);
});

socket.on("disconnect", (reason) => {
    console.log("Disconnected: " + reason);
});

