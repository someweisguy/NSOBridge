import { useContext, useState } from "react";
import { BoutContext } from "../App";
import { JamId, useJamNavigation } from "../hooks/jam";
import useBout, { BoutType } from "../hooks/bout";
import TripSetter from "../components/TripSetter";

export default function ScoreboardOperator() {
  // Get the selected Bout ID
  const boutId: string = useContext(BoutContext);
  const bout: BoutType = useBout(boutId);

  // Get the latest Jam ID and Jam
  const [jamId, setJamId] = useState<JamId>(() => {
    const periodIndex: number = bout.jams.counts[1] > 0 ? 1 : 0;
    const jamIndex: number = bout.jams.counts[periodIndex] - 1;
    return [periodIndex, jamIndex]; // TODO: get active Jam, not latest Jam
  });
  const [previousJamId, nextJamId] = useJamNavigation(boutId, jamId);
  const [periodIndex, jamIndex] = jamId;

  return (
    <>
      <div>
        <div>
          <button
            disabled={previousJamId == null}
            onClick={() => setJamId(previousJamId!)}
          >
            Previous Jam
          </button>
          P{periodIndex + 1} J{jamIndex + 1}
          <button
            disabled={nextJamId == null}
            onClick={() => setJamId(nextJamId!)}
          >
            Next Jam
          </button>
        </div>
        <div className="flex flex-row justify-center space-x-4">
          <TripSetter boutId={boutId} jamId={jamId} team={"home"} />
          <TripSetter boutId={boutId} jamId={jamId} team={"away"} />
        </div>
      </div>
    </>
  );
}
