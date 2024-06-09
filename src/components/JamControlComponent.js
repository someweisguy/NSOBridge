import { sendRequest } from "../App";

const CALLED = 1;
const INJURY = 2;
const TIME = 3;
const OTHER = 4;

export function StartJamComponent({ }) {

  function startJam() {
    sendRequest("startJam");
  }

  return (
    <button onClick={startJam}>Start</button>
  );
}

export function StopJamComponent({ }) {

  function stopJam() {
    sendRequest("stopJam", { stopReason: CALLED });
  }

  return (
    <button onClick={stopJam}>Stop</button>
  );
}