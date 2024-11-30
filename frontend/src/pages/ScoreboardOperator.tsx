import { useContext, useState } from "react";
import { BoutContext } from "../App";
import { JamId } from "../hooks/jam";
import useBout, { BoutType } from "../hooks/bout";

import JamNav from "../features/jamnav/components/JamNav";
import ScoreManager from "../features/score/components/ScoreManager";

export default function ScoreboardOperator() {
  // Get the selected Bout ID
  const boutId: string = useContext(BoutContext);
  const bout: BoutType = useBout(boutId);

  // Get the latest Jam ID and Jam
  const [jamId] = useState<JamId>(() => {
    const periodIndex: number = bout.jams.counts[1] > 0 ? 1 : 0;
    const jamIndex: number = bout.jams.counts[periodIndex] - 1;
    return [periodIndex, jamIndex]; // TODO: get active Jam, not latest Jam
  });
  // const [previousJamId, nextJamId] = useJamNavigation(boutId, jamId);
  // const [periodIndex, jamIndex] = jamId;

  return (
    <>
    <div className="flex flex-col items-center">

      <JamNav />
      <div className="flex flex-row gap-4">
        <div className="flex flex-col items-center">
          <ScoreManager boutId={boutId} jamId={jamId} team="home"/>
 


        </div>
        <div className="flex flex-col items-center">
          <ScoreManager boutId={boutId} jamId={jamId} team="away" />

        </div>
      </div>
    </div>
    </>
  );
}
