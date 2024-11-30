import { useContext } from "react";
import { BoutContext } from "../App";

import JamNav from "../features/jamnav/components/JamNav";
import ScoreManager from "../features/score/components/ScoreManager";
import { JamIndex } from "../features/jamnav/types/JamIndex";
import useJamIndex from "../features/jamnav/hooks/useJamIndex";

export default function ScoreboardOperator() {
  // Get the selected Bout ID
  const boutId: string = useContext(BoutContext);
  const jamIndex: JamIndex = useJamIndex(boutId);

  const jamId = jamIndex.currentJamId;

  return (
    <>
      <div className="flex flex-col items-center">
        <JamNav jamIndex={jamIndex} />
        <div className="flex flex-row gap-4">
          <div className="flex flex-col items-center">
            <ScoreManager boutId={boutId} jamId={jamId} team="home" />
          </div>
          <div className="flex flex-col items-center">
            <ScoreManager boutId={boutId} jamId={jamId} team="away" />
          </div>
        </div>
      </div>
    </>
  );
}
