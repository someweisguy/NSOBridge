import { ReactElement, useCallback, useContext } from "react";
import { BoutIdContext } from "../../../contexts/BoutIdContext";
import dispatch from "../../../app/client";
import { useSocketState } from "../../../app/hooks/useConnection";
import useClock from "../../../hooks/useClock";
import { BoutIdType } from "../../../types/bout";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import Clock from "@/components/clock";

export default function TimeoutController(): ReactElement {
  const boutId: BoutIdType = useContext(BoutIdContext);

  const timeoutIsRunning = useClock<boolean>(
    boutId,
    "timeout",
    (clock) => clock.isRunning
  );
  const jamIsRunning = useClock<boolean>(
    boutId,
    "jam",
    (clock) => clock.isRunning
  );

  const { latency } = useSocketState();

  const callTimeout = useCallback(() => {
    dispatch("bout", "callTimeout", { boutId, latency });
  }, [boutId, latency]);

  const endTimeout = useCallback(() => {
    dispatch("bout", "endTimeout", { boutId, latency });
  }, [boutId, latency]);

  if (!timeoutIsRunning) {
    return (
      <Button onClick={callTimeout} disabled={jamIsRunning}>
        Call Timeout
      </Button>
    );
  }

  return (
    <div className="flex w-full whitespace-nowrap">
      <div className="max-w-fit">
        <ToggleGroup type="single">
          <ToggleGroupItem value="official">Official</ToggleGroupItem>
          <ToggleGroupItem value="home">Home</ToggleGroupItem>
          <ToggleGroupItem value="away">Away</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="max-w-fit">
      <ToggleGroup type="single">
          <ToggleGroupItem value="home">Home</ToggleGroupItem>
          <ToggleGroupItem value="away">Away</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <Button>Retained</Button>
      <Button color="red" onClick={endTimeout}>
        <Clock {...useClock(boutId, "timeout")} />
      </Button>
    </div>
  );
}
