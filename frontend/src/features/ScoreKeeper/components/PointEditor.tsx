import { ReactElement, useCallback } from "react";
import setTrip from "../api/setTrip";
import { JamIdType } from "../../../types/JamIdType";
import ComboButton from "../../../components/ComboButton";
import Button from "../../../components/Button";

export default function PointEditor({
  boutId,
  jamId,
  team,
  selectedTrip,
  showInitial,
}: {
  boutId: string;
  jamId: JamIdType;
  team: "home" | "away";
  selectedTrip: number;
  showInitial: boolean;
}): ReactElement {
  const setPoints = useCallback(
    (points: number, validPass: boolean = true) =>
      setTrip(boutId, jamId, team, selectedTrip, points, validPass),
    [boutId, jamId, team, selectedTrip]
  );

  if (showInitial) {
    return (
      <ComboButton>
        <Button onClick={() => setPoints(0, false)}>NP/NP</Button>
        <Button onClick={() => setPoints(0)}>Initial</Button>
      </ComboButton>
    );
  } else {
    return (
      <ComboButton>
        <Button onClick={() => setPoints(0)}>0</Button>
        <Button onClick={() => setPoints(1)}>1</Button>
        <Button onClick={() => setPoints(2)}>2</Button>
        <Button onClick={() => setPoints(3)}>3</Button>
        <Button onClick={() => setPoints(4)}>4</Button>
      </ComboButton>
    );
  }
}
