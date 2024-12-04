import { useCallback, useContext, useRef } from "react";
import { BoutContext } from "../App";
import JamNavigator from "../../features/JamNavigator/components/JamNavigator";
import ScoreKeeper from "../../features/ScoreKeeper/components/ScoreKeeper";
import { JamNavigationType } from "../../features/JamNavigator/types/JamNavigationType";
import useJamNavigation from "../../features/JamNavigator/hooks/useJamNavigation";
import { sendQuery, useConnection } from "../client";
import { DurationType } from "../../types/DurationType";
import usePlayClock from "../../hooks/usePlayClock";

export default function ScoreboardOperator() {
  // Get the selected Bout ID
  const boutId: string = useContext(BoutContext);
  const jamIndex: JamNavigationType = useJamNavigation(boutId);

  const jamId = jamIndex.currentJamId;

  const { latency } = useConnection();
  const latencyRef = useRef(latency);

  const startJam = useCallback(() => {
    sendQuery("bout", "startJam", { boutId, latency: latencyRef.current });
  }, [boutId]);

  const playClock: DurationType = usePlayClock(boutId);

  const seconds = playClock.seconds < 10 ? "0" + playClock.seconds : playClock.seconds;
  const deciseconds = Math.floor(playClock.milliseconds / 100);

  return (
    <>
      <div className="flex flex-col items-center">
        <JamNavigator jamIndex={jamIndex} />
        <button onClick={startJam}>Start Jam</button>
        <p>{playClock.minutes}:{seconds}.{deciseconds}</p>
        <div className="flex flex-row gap-4">
          <div className="flex flex-col items-center">
            <ScoreKeeper boutId={boutId} jamId={jamId} team="home" />
          </div>
          <div className="flex flex-col items-center">
            <ScoreKeeper boutId={boutId} jamId={jamId} team="away" />
          </div>
        </div>
      </div>
    </>
  );
}
