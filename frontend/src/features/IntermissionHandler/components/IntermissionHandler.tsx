import {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSocketState } from "../../../app/hooks/useConnection";
import { BoutIdContext } from "../../../contexts/BoutIdContext";
import dispatch from "../../../app/client";
import useClock from "../../../hooks/useClock";
import useBout from "../../../hooks/useBout";
import useAlarmEffect from "../../../hooks/useAlarmEffect";
import { BoutIdType } from "../../../types/bout";
import { Button } from "@/components/ui/button";
import Clock from "@/components/clock";

export default function IntermissionHandler(): ReactElement {
  const boutId: BoutIdType = useContext(BoutIdContext);

  // Get the required data to determine if the Intermission is ready to start
  const scoreState = useBout(boutId, (bout) => bout.scoreState);
  const playState = useBout(boutId, (bout) => bout.playState);
  const intermissionIsRunning = useClock<boolean>(
    boutId,
    "intermission",
    (clock) => clock.isRunning
  );
  const currentHalf = useBout<number>(boutId, (bout) => {
    return Number(bout.numJams[1] > 0);
  });

  // Allow ending the Period when 5 seconds remain
  const [readyToEndPeriod, setReadyToEndPeriod] = useState<boolean>(false);
  useAlarmEffect(() => setReadyToEndPeriod(true), [boutId, "period", 5000]);
  useEffect(() => setReadyToEndPeriod(false), [boutId, currentHalf]);

  // Declare start/stop intermission callbacks
  const { latency } = useSocketState();
  const startIntermission = useCallback(() => {
    dispatch("bout", "startIntermission", { boutId, latency });
  }, [boutId, latency]);
  const stopIntermission = useCallback(() => {
    dispatch("bout", "stopIntermission", { boutId, latency });
  }, [boutId, latency]);

  if (scoreState === "live" && playState === "stopped") {
    return (
      <Button
        color={intermissionIsRunning ? "red" : "none"}
        onClick={intermissionIsRunning ? stopIntermission : startIntermission}
      >
        {!intermissionIsRunning ? (
          "Start Intermission Clock"
        ) : (
          <Clock {...useClock(boutId, "intermission")} />
        )}
      </Button>
    );
  } else if (scoreState === "live") {
    return (
      <Button
        disabled={!readyToEndPeriod || playState !== "lineup"}
        onClick={() => dispatch("bout", "advanceGameState", { boutId })}
      >
        End Period {currentHalf + 1}
      </Button>
    );
  } else {
    return (
      <Button
        disabled={scoreState === "final"}
        onClick={() => dispatch("bout", "advanceGameState", { boutId })}
      >
        Set Final Score
      </Button>
    );
  }
}
