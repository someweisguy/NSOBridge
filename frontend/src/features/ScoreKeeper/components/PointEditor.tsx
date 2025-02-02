import { ReactElement, useCallback } from "react";
import setTrip from "../api/setTrip";
import { JamIdType } from "../../../types/jam";
import { Button } from "@/components/ui/button";

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
      <>
        <Button onClick={() => setPoints(0, false)}>NP/NP</Button>
        <Button onClick={() => setPoints(0)}>Initial</Button>
      </>
    );
  } else {
    return (
      <>
        <Button onClick={() => setPoints(0)}>0</Button>
        <Button onClick={() => setPoints(1)}>1</Button>
        <Button onClick={() => setPoints(2)}>2</Button>
        <Button onClick={() => setPoints(3)}>3</Button>
        <Button onClick={() => setPoints(4)}>4</Button>
      </>
    );
  }
}
