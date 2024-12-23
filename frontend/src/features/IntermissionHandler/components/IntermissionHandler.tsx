import { ReactElement, useCallback, useContext } from "react";
import { useSocketState } from "../../../app/hooks/useConnection";
import { BoutIdType } from "../../../types/BoutIdType";
import { BoutIdContext } from "../../../contexts/BoutIdContext";
import dispatch from "../../../app/client";
import Button from "../../../components/Button";
import Clock from "../../DynamicClock/components/Clock";
import useIntermissionIsReady from "../hooks/useIntermissionIsReady";
import useClock from "../../../hooks/useClock";

export default function IntermissionHandler(): ReactElement {
  const boutId: BoutIdType = useContext(BoutIdContext);

  // Get the required data to determine if the Intermission is ready to start
  const intermissionIsRunning = useClock<boolean>(
    boutId,
    "intermission",
    (clock) => clock.isRunning
  );
  const lineupIsRunning = useClock<boolean>(
    boutId,
    "lineup",
    (clock) => clock.isRunning
  );
  const isReady = useIntermissionIsReady(boutId);
  const { latency } = useSocketState();

  const startIntermission = useCallback(() => {
    dispatch("bout", "startIntermission", {
      boutId,
      latency,
      advanceGameState: lineupIsRunning,
    });
  }, [boutId, latency, lineupIsRunning]);

  const stopIntermission = useCallback(() => {
    dispatch("bout", "stopIntermission", { boutId, latency });
  }, [boutId, latency]);

  if (!intermissionIsRunning) {
    return (
      <Button disabled={!isReady} onClick={startIntermission}>
        Start Intermission
      </Button>
    );
  } else {
    return (
      <Button onClick={stopIntermission} color="red">
        <Clock type="intermission" millisStyle="never" />
      </Button>
    );
  }
}
