async function getEpsilon(iterations) {
    const socket = io();
    var epsilon = 0;
    var successes = 0;
    for (var i = 0; i < iterations; ++i) {
        try {
            const start = Date.now();
            const response = await socket.emitWithAck("sync");
            const end = Date.now();
            const delay = (end - start) / 2;
            epsilon += start - (response - delay);
            ++successes;
        } catch {
            continue;
        }
    }
    return Math.round(epsilon / successes);
}

var epsilon = null;
const socket = io();
socket.on("connect", async () => {
    console.log("Connected to game server");
    const iterations = 10;
    console.log("Syncing time with server using " + iterations + " iterations");
    epsilon = await getEpsilon(iterations);
    console.log("Time sync epsilon is " + epsilon);
});