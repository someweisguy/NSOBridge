import { ReactElement, useCallback, useContext } from "react";
import { useSocketState } from "../../../app/hooks/useConnection";
import { BoutIdType } from "../../../types/BoutIdType";
import { BoutIdContext } from "../../../contexts/BoutIdContext";
import dispatch from "../../../app/client";
import Button from "../../../components/Button";
import Clock from "../../DynamicClock/components/Clock";
import useAdvanceStateIsReady from "../hooks/useIntermissionIsReady";
import useClock from "../../../hooks/useClock";
import usePlayState from "../hooks/usePlayState";
import useBout from "../../../hooks/useBout";

export default function IntermissionHandler(): ReactElement {
  const boutId: BoutIdType = useContext(BoutIdContext);

  // Get the required data to determine if the Intermission is ready to start
  const scoreState = useBout(boutId, (bout) => bout.scoreState);
  const isReady = useAdvanceStateIsReady(boutId);
  const playState = usePlayState(boutId);
  const intermissionIsRunning = useClock<boolean>(
    boutId,
    "intermission",
    (clock) => clock.isRunning
  );
  const currentHalf = useBout<number>(boutId, (bout) => {
    return Number(bout.numJams[1] > 0);
  });

  // Declare start/stop intermission callbacks
  const { latency } = useSocketState();
  const startIntermission = useCallback(() => {
    dispatch("bout", "startIntermission", { boutId, latency });
  }, [boutId, latency]);
  const stopIntermission = useCallback(() => {
    dispatch("bout", "stopIntermission", { boutId, latency });
  }, [boutId, latency]);

  // Render end Period button
  if (scoreState === "live") {
    if (playState !== "stopped") {
      return (
        <Button
          disabled={!isReady}
          onClick={() => dispatch("bout", "advanceGameState", { boutId })}
        >
          End Period {currentHalf + 1}
        </Button>
      );
    } else if (!intermissionIsRunning) {
      return (
        <Button disabled={!isReady} onClick={startIntermission}>
          Start Intermission Clock
        </Button>
      );
    } else {
      return (
        <Button onClick={stopIntermission} color="red">
          <Clock type="intermission" millisStyle="never" />
        </Button>
      );
    }
  } else {
    return (
      <Button
        disabled={scoreState === "final"}
        onClick={() => dispatch("bout", "advanceGameState", { boutId })}
      >
        Set Official Score
      </Button>
    );
  }
}
