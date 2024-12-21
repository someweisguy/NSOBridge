import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSocketState } from "../../../app/hooks/useConnection";
import { BoutIdType } from "../../../types/BoutIdType";
import { BoutIdContext } from "../../../contexts/BoutIdContext";
import { keyFactory } from "../../../utils/keyFactory";
import { ClockType } from "../../../types/ClockType";
import dispatch from "../../../app/client";
import useBout from "../../../hooks/useBout";
import Button from "../../../components/Button";
import Clock from "../../../components/Clock";

const type = "period";

export default function IntermissionHandler(): ReactElement {
  const boutId: BoutIdType = useContext(BoutIdContext);

  // Get the Period and Intermission Clocks
  const { latency } = useSocketState();
  const { data: periodClockSnapshot } = useSuspenseQuery<ClockType>({
    queryKey: keyFactory.clock(boutId, type),
    queryFn: () => dispatch("clock", "get", { boutId, type, latency }),
  });

  const gameState = useBout<string>(boutId, (bout) => bout.gameState);
  const [isReady, setIsReady] = useState<boolean>(
    ["stopped", "intermission"].includes(gameState) ||
      periodClockSnapshot.alarm! - periodClockSnapshot.elapsed < 5000
  );

  const startIntermission = useCallback(() => {
    dispatch("bout", "startIntermission", { boutId, latency });
  }, [boutId, latency]);

  const stopIntermission = useCallback(() => {
    dispatch("bout", "stopIntermission", { boutId, latency });
  }, [boutId, latency]);

  useEffect(() => {
    const remaining = periodClockSnapshot.alarm! - periodClockSnapshot.elapsed;
    if (isReady) {
      return;
    } else if (remaining < 5000) {
      setIsReady(true);
      return;
    }

    const timeoutId = setTimeout(() => {
      setIsReady(true);
    }, remaining - 5000);
    return () => clearTimeout(timeoutId);
  }, [periodClockSnapshot, isReady]);

  if (gameState !== "intermission") {
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
