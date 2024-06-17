import { useState } from "react";
import { useSocketGetter, sendRequest } from "../App";

const CALLED = "called";
const INJURY = "injury";
const TIME = "time";
const UNKNOWN = "unknown";

export function JamControlComponent({ }) {
  const [isStarted, setIsStarted] = useState(false);
  const [stopReason, setStopReason] = useState(null);

  function jamCallback({ startTime, stopReason }) {
    setIsStarted(startTime !== false);
    setStopReason(stopReason);
  }
  useSocketGetter("jam", jamCallback);

  const isStopped = stopReason !== null;

  let nextJamButton = null;
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
    nextJamButton = (
      <button>Start Next Jam</button>
    );
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
      {nextJamButton}{label}{buttons}
    </div>
  );
}