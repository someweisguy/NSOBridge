import { useContext, useState } from "react";
import { BoutContext } from "../App";
import useJam, { JamId, JamType, useJamNavigation } from "../hooks/jam";
import useBout, { BoutType } from "../hooks/bout";

export default function ScoreboardOperator() {
  // Get the selected Bout ID
  const boutId: string = useContext(BoutContext);
  const bout: BoutType = useBout(boutId);

  // Get the latest Jam ID and Jam
  const [jamId, setJamId] = useState<JamId>(() => {
    const periodIndex: number = bout.jams.jamCounts[1] > 0 ? 1 : 0;
    const jamIndex: number = bout.jams.jamCounts[periodIndex] - 1;
    return [periodIndex, jamIndex];  // TODO: get active Jam, not latest Jam
  });
  const [previousJamId, nextJamId] = useJamNavigation(boutId, jamId);
  const jam: JamType = useJam(boutId, jamId);

  const [periodIndex, jamIndex] = jamId;

  return (
    <>
      <div>
        <div>
          <button disabled={previousJamId == null} onClick={() => setJamId(previousJamId!)}>
            Previous Jam
          </button>
          P{periodIndex + 1} J{jamIndex + 1}
          <button disabled={nextJamId == null} onClick={() => setJamId(nextJamId!)}>
            Next Jam
          </button>
        </div>
        {JSON.stringify(jam)}
      </div>

    </>
  );
}
