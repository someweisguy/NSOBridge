import "./socket.io-client/dist/socket.io.min.js"

// Connect to the host using a userId
var userId = localStorage.getItem("userId");
export const socket = io(window.location.host, {auth: {token: userId}});
socket.once("userId", (newUserId) => {
    console.log("Got User ID: " + newUserId);
    localStorage.setItem("userId", newUserId);
    userId = newUserId;
});

socket.on("connect", async () => {
    console.log("Connected to game server.");
    const iterations = 10;
    console.log("Syncing time with server using " + iterations + " iterations");
    epsilon = await getEpsilon(iterations);
    
    
    setInterval(() => {
        document.getElementById("time").innerText = (getTick() / 1000).toFixed(1)
    }, 50);
});

var epsilon = 0;

export async function getEpsilon(iterations) {
    var sum = 0;
    var oldServerTime = 0;
    for (var i = 0; i < iterations; ++i) {
        const start = window.performance.now();
        oldServerTime = await socket.emitWithAck("sync");
        oldServerTime = oldServerTime.tick;  // TODO: streamline this 
        sum += (window.performance.now() - start);
    }
    const currentServerTime = oldServerTime + Math.round((sum / 2) / iterations);
    return Math.round(window.performance.now()) - currentServerTime;
}

export function getTick() {
    return Math.round(window.performance.now()) - epsilon;
}


socket.on("disconnect", (reason) => {
    // TODO: better disconnect handling, see socketio docs
    console.log("Disconnected: " + reason);
    localStorage.removeItem("userId");
    socket.close();
});
