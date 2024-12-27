import { ReactElement, useCallback, useContext } from "react";
import { useSocketState } from "../../../app/hooks/useConnection";
import { BoutIdType } from "../../../types/BoutIdType";
import { BoutIdContext } from "../../../contexts/BoutIdContext";
import dispatch from "../../../app/client";
import Button from "../../../components/Button";
import Clock from "../../DynamicClock/components/Clock";
import useIntermissionIsReady from "../hooks/useIntermissionIsReady";
import useClock from "../../../hooks/useClock";
import usePlayState from "../hooks/usePlayState";

export default function IntermissionHandler(): ReactElement {
  const boutId: BoutIdType = useContext(BoutIdContext);

  // Get the required data to determine if the Intermission is ready to start
  const intermissionIsRunning = useClock<boolean>(
    boutId,
    "intermission",
    (clock) => clock.isRunning
  );
  const isReady = useIntermissionIsReady(boutId);
  const { latency } = useSocketState();

  const playState = usePlayState(boutId);

  const startIntermission = useCallback(() => {
    dispatch("bout", "startIntermission", {
      boutId,
      latency,
    });
  }, [boutId, latency,]);

  const stopIntermission = useCallback(() => {
    dispatch("bout", "stopIntermission", { boutId, latency });
  }, [boutId, latency]);

  if (playState !== "stopped") {
    return (
      <Button
        disabled={!isReady}
        onClick={() => dispatch("bout", "advanceGameState", { boutId })}
      >
        End Half
      </Button>
    );
  } else if (!intermissionIsRunning) {
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
