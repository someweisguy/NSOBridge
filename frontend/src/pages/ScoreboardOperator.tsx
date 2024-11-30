import { useContext } from "react";
import { BoutContext } from "../App";

import JamNavigator from "../features/jamNavigation/components/JamNavigator";
import ScoreManager from "../features/score/components/ScoreManager";
import { JamNavigationType } from "../features/jamNavigation/types/JamNavigationType";
import useJamNavigation from "../features/jamNavigation/hooks/useJamNavigation";

export default function ScoreboardOperator() {
  // Get the selected Bout ID
  const boutId: string = useContext(BoutContext);
  const jamIndex: JamNavigationType = useJamNavigation(boutId);

  const jamId = jamIndex.currentJamId;

  return (
    <>
      <div className="flex flex-col items-center">
        <JamNavigator jamIndex={jamIndex} />
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
