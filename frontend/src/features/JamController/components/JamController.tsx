import { ReactElement, useCallback, useContext } from "react";
import { BoutIdContext } from "../../../contexts/BoutIdContext";
import { useSocketState } from "../../../app/hooks/useConnection";
import dispatch from "../../../app/client";
import Clock from "../../DynamicClock/components/Clock";
import useClock from "../../../hooks/useClock";
import { BoutIdType } from "../../../types/bout";
import { Button } from "@/components/ui/button";

export default function JamController(): ReactElement {
  const boutId: BoutIdType = useContext(BoutIdContext);
  const { latency } = useSocketState();

  const jamIsRunning = useClock<boolean>(boutId, "jam", (clock) => clock.isRunning);
  const timeoutIsRunning = useClock<boolean>(boutId, "timeout", (clock) => clock.isRunning);
  const lineupIsRunning = useClock<boolean>(boutId, "lineup", (clock) => clock.isRunning);

  const startStopJam = useCallback(() => {
    if (!jamIsRunning) {
      dispatch("bout", "startJam", { boutId, latency });
    } else {
      dispatch("bout", "stopJam", { boutId, latency });
    }
  }, [boutId, jamIsRunning, latency]);

  if (!jamIsRunning) {
    return (
      <Button
        disabled={timeoutIsRunning}
        onClick={startStopJam}
        color="green"
      >
        <p className="min-w-20">
          Start Jam{" "}
          {lineupIsRunning && !timeoutIsRunning && (
            <>
              &nbsp; <Clock type="lineup" millisStyle="never" />
            </>
          )}
        </p>
      </Button>
    );
  } else {
    return (
      <Button onClick={startStopJam} color="red">
        <Clock type="jam" />
      </Button>
    );
  }
}
