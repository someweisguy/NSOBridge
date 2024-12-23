import { ReactElement, useCallback, useContext } from "react";
import Button from "../../../components/Button";
import { BoutIdType } from "../../../types/BoutIdType";
import { BoutIdContext } from "../../../contexts/BoutIdContext";
import dispatch from "../../../app/client";
import { useSocketState } from "../../../app/hooks/useConnection";
import Clock from "../../DynamicClock/components/Clock";
import ComboButton from "../../../components/ComboButton";
import useClock from "../../../hooks/useClock";

export default function TimeoutController(): ReactElement {
  const boutId: BoutIdType = useContext(BoutIdContext);

  const timeoutIsRunning = useClock<boolean>(boutId, "timeout", (clock) => clock.isRunning);
  const jamIsRunning = useClock<boolean>(boutId, "jam", (clock) => clock.isRunning);


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
        <ComboButton>
          <Button>Official</Button>
          <Button>Home</Button>
          <Button>Away</Button>
        </ComboButton>
      </div>
      <div className="max-w-fit">
        <ComboButton>
          <Button>Home</Button>
          <Button>Away</Button>
        </ComboButton>
      </div>
      <Button>Retained</Button>
      <Button color="red" onClick={endTimeout}>
        <Clock type="timeout" />
      </Button>
    </div>
  );
}
