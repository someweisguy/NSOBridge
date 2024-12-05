import { useCallback, useContext, useRef } from "react";
import ScoreKeeper from "../../features/ScoreKeeper/components/ScoreKeeper";
import { sendQuery, useConnection } from "../client";
import { DurationType } from "../../types/DurationType";
import usePlayClock from "../../hooks/usePlayClock";
import JamController from "../../features/JamController/components/JamController";
import { BoutIdContext } from "../../contexts/BoutIdContext";

export default function ScoreboardOperator() {
  // Get the selected Bout ID
  const boutId: string = useContext(BoutIdContext);

  const { latency } = useConnection();
  const latencyRef = useRef(latency);

  const startJam = useCallback(() => {
    sendQuery("bout", "startJam", { boutId, latency: latencyRef.current });
  }, [boutId]);

  const playClock: DurationType = usePlayClock(boutId);

  const seconds =
    playClock.seconds < 10 ? "0" + playClock.seconds : playClock.seconds;
  const deciseconds = Math.floor(playClock.milliseconds / 100);

  return (
    <>
      <div className="flex flex-col items-center">
        <JamController>
          <button onClick={startJam}>Start Jam</button>
          <p>
            {playClock.minutes}:{seconds}.{deciseconds}
          </p>
          <div className="flex flex-row gap-4">
            <div className="flex flex-col items-center">
              <ScoreKeeper team="home" />
            </div>
            <div className="flex flex-col items-center">
              <ScoreKeeper team="away" />
            </div>
          </div>
        </JamController>
      </div>
    </>
  );
}
