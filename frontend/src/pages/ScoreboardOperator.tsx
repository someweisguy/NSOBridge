import { useContext, useState } from "react";
import { BoutContext } from "../App";
import useJam, { JamType, useJamNavigation } from "../hooks/jam";

export default function ScoreboardOperator() {
  // Get the selected Bout ID
  const boutId: string = useContext(BoutContext);

  // Get the latest Jam ID and Jam
  const [jamId, setJamId] = useState<[string, number, number]>(() => {
    return [boutId, 0, 0];  // TODO: get active Jam
  });
  const [previousJamId, nextJamId] = useJamNavigation(jamId);
  const jam: JamType = useJam(jamId);

  console.log(previousJamId, nextJamId)

  return (
    <>
      <div>
        <div>
          <button disabled={previousJamId == null} onClick={() => setJamId(previousJamId!)}>
            Previous Jam
          </button>
          P{jamId[1]} J{jamId[2]}
          <button disabled={nextJamId == null} onClick={() => setJamId(nextJamId!)}>
            Next Jam
          </button>
        </div>
        {JSON.stringify(jam)}
      </div>

    </>
  );
}
