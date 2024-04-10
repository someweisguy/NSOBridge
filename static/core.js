const socket = io()
var epsilon = 0;

async function getEpsilon(iterations) {
    const socket = io();
    var epsilon = 0;
    var successes = iterations;
    for (var i = 0; i < iterations; ++i) {
        try {
            const start = Date.now();
            const response = await socket.emitWithAck("sync");
            const end = Date.now();
            const delay = (end - start) / 2;
            epsilon += start - (response - delay);
        } catch {
            --successes;
            continue;
        }
    }
    if (successes < iterations) {
        console.log("Sync iteration failed " + (iterations - successes) + "out of " + iterations + " times");
    }
    return Math.round(epsilon / successes);
}

function getServerTime() {
    return Date.now() - epsilon;
}

socket.on("connect", async () => {
    console.log("Connected to game server");
    const iterations = 10;
    console.log("Syncing time with server using " + iterations + " iterations");
    epsilon = await getEpsilon(iterations);
    console.log("Time sync epsilon is " + epsilon);

    const event = new Event("serverSync");
    document.dispatchEvent(event)

});

socket.on("disconnect", (reason) => {
    console.log("Disconnected: " + reason);
});
