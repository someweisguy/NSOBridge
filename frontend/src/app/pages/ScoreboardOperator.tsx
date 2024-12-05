import { useContext } from "react";
import ScoreKeeper from "../../features/ScoreKeeper/components/ScoreKeeper";
import { DurationType } from "../../types/DurationType";
import usePlayClock from "../../hooks/usePlayClock";
import JamController from "../../features/JamController/components/JamController";
import { BoutIdContext } from "../../contexts/BoutIdContext";

export default function ScoreboardOperator() {
  // Get the selected Bout ID
  const boutId: string = useContext(BoutIdContext);
  const playClock: DurationType = usePlayClock(boutId);

  const seconds =
    playClock.seconds < 10 ? "0" + playClock.seconds : playClock.seconds;
  const deciseconds = Math.floor(playClock.milliseconds / 100);

  return (
    <>
      <div className="flex flex-col items-center">
        <JamController>
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
