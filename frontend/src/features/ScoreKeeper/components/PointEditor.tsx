import { ReactElement, useCallback } from "react";
import PointButton from "./PointButton";
import setTrip from "../api/setTrip";
import { JamIdType } from "../../../types/JamIdType";

export default function PointEditor({
  boutId,
  jamId,
  team,
  selectedTrip,
  showInitial,
  reverse = false,
}: {
  boutId: string;
  jamId: JamIdType;
  team: "home" | "away";
  selectedTrip: number;
  showInitial: boolean;
  reverse?: boolean;
}): ReactElement {
  const setPoints = useCallback(
    (points: number, validPass: boolean = false) => {
      setTrip(boutId, jamId, team, selectedTrip, points, validPass);
    },
    [boutId, jamId, team, selectedTrip]
  );

  // Create the buttons, either points or Initial Pass
  const buttonArray: ReactElement[] = [];
  if (showInitial) {
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
