import { useContext, useState } from "react";
import { BoutContext } from "../App";
import useBout, { Bout } from "../hooks/bout";
import useJam, { JamType } from "../hooks/jam";

export default function ScoreboardOperator() {
  const boutId: string = useContext(BoutContext);
  const bout: Bout = useBout(boutId);

  const [periodId, setPeriodId] = useState<number>(
    bout.jams.jamCounts[1] == 0 ? 0 : 1
  );
  const [jamId, setJamId] = useState<number>(bout.jams.jamCounts[periodId] - 1);

  const jam: JamType = useJam(boutId, periodId, jamId);

  // FIXME: remove this clause
  if (periodId == 3) {
    setPeriodId(0);
    setJamId(0);
  }

  return (
    <>
      <div></div>
      {JSON.stringify(jam)}
    </>
  );
}
