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
import dispatch from "../../../app/client";
import useBout from "../../../hooks/useBout";
import Button from "../../../components/Button";
import Clock from "../../DynamicClock/components/Clock";
import { GameStates } from "../../../types/GameStates";
import useClock from "../../../hooks/useClock";


export default function IntermissionHandler(): ReactElement {
  const boutId: BoutIdType = useContext(BoutIdContext);

  // Get the Period and Intermission Clocks
  const { latency } = useSocketState();
  const periodClockSnapshot = useClock(boutId, "period");
  const intermissionClockSnapshot = useClock(boutId, "intermission");

  const gameState = useBout<GameStates>(boutId, (bout) => bout.gameState);
  const [isReady, setIsReady] = useState<boolean>(
    ["pregame", "halftime"].includes(gameState) ||
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

  if (!intermissionClockSnapshot.isRunning) {
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
