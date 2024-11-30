import { ReactElement, useCallback } from "react";
import PointButton from "./PointButton";
import { sendQuery } from "../../../hooks/client";

export default function ScoreButtons({
  useInitial,
  boutId,
  jamId,
  tripId,
  reverse = false,
}: {
  useInitial: boolean;
  boutId: string;
  jamId: [number, number];
  tripId: number;
  reverse?: boolean;
}): ReactElement {
  const setPoints = useCallback(
    (points: number, validPass: boolean = false) => {
      sendQuery("score", "setTrip", {
        boutId,
        jamId,
        tripId,
        points,
        validPass,
      });
    },
    [boutId, jamId, tripId]
  );

  // Create the buttons, either points or Initial Pass
  const buttonArray: ReactElement[] = [];
  if (useInitial) {
    buttonArray.push(
      <PointButton onClick={() => setPoints(0, false)}>NP/NP</PointButton>
    );
    buttonArray.push(
      <PointButton onClick={() => setPoints(0)}>Initial</PointButton>
    );
  } else {
    for (let i = 0; i <= 4; i++) {
      buttonArray.push(
        <PointButton onClick={() => setPoints(i)}>{i}</PointButton>
      );
    }
  }

  return (
    <div
      className={`flex m-4 w-72 justify-between rounded-full bg-slate-300 ${
        reverse ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {buttonArray}
    </div>
  );
}
