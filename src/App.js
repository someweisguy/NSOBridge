import logo from './logo.svg';
import './App.css';

import { io } from 'socket.io-client';

var userId = localStorage.getItem("userId");
const socket = io(window.location.host, { auth: { token: userId } });
var epsilon = 0;

export function getTick() {
  return Math.round(window.performance.now()) - epsilon;
}

export async function getEpsilon(iterations) {
  let sum = 0;
  let oldServerTime = 0;
  for (var i = 0; i < iterations; ++i) {
    const start = window.performance.now();
    oldServerTime = await socket.emitWithAck("sync");
    oldServerTime = oldServerTime.tick;  // TODO: streamline this 
    sum += (window.performance.now() - start);
  }
  const currentServerTime = oldServerTime + Math.round((sum / 2) / iterations);
  return Math.round(window.performance.now()) - currentServerTime;
}

function App() {
  socket.once("userId", (newUserId) => {
    console.log("Got User ID: " + newUserId);
    localStorage.setItem("userId", newUserId);
    userId = newUserId;
  });
  socket.on("connect", async () => {
    await getEpsilon(10);
  });


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
