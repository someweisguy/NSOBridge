import { useState } from "react";
import { useInterface, sendRequest } from "../App";

const CALLED = "called";
const INJURY = "injury";
const TIME = "time";
const UNKNOWN = "unknown";

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

export function JamControlComponent({ }) {
  const [isStarted, setIsStarted] = useState(false);
  const [stopReason, setStopReason] = useState(null);

  function jamCallback({ startTime, stopReason }) {
    setIsStarted(startTime !== false);
    setStopReason(stopReason);
  }
  useInterface("jam", jamCallback);

  const isStopped = stopReason !== null;

  let label = null;
  const buttons = [];
  if (!isStarted) {
    buttons.push(
      <button onClick={() => sendRequest("startJam")}>Start Jam</button>
    );
  } else if (!isStopped) {
    buttons.push(
      <button onClick={() => sendRequest("stopJam")}>Stop Jam</button>
    );
  } else {
    label = (<small>Set stop reason: </small>);
    buttons.push(
      <button onClick={() => sendRequest("setJamStopReason", { stopReason: CALLED })}
        disabled={stopReason === CALLED}>Called</button>
    );
    buttons.push(
      <button onClick={() => sendRequest("setJamStopReason", { stopReason: TIME })}
        disabled={stopReason === TIME}>Time</button>
    );
    buttons.push(
      <button onClick={() => sendRequest("setJamStopReason", { stopReason: INJURY })}
        disabled={stopReason === INJURY}>Injury</button>
    );
  }

  return (
    <div>
      {label}{buttons}
    </div>
  );
}