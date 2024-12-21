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

  // Get the required data to determine if the Intermission is ready to start
  const { latency } = useSocketState();
  const periodClockSnapshot = useClock(boutId, "period");
  const [lastPeriodClockSnapshot, setLastPeriodClockSnapshot] = useState(
    window.performance.now()
  );
  const intermissionClockSnapshot = useClock(boutId, "intermission");
  const gameState = useBout<GameStates>(boutId, (bout) => bout.gameState);

  // Determine if the Intermission is ready to start
  const [isReady, setIsReady] = useState<boolean>(
    ["pregame", "halftime"].includes(gameState) ||
      periodClockSnapshot.alarm! - periodClockSnapshot.elapsed < 5000
  );

  // Update the lastPeriodClockSnapshot when the periodClockSnapshot changes
  useEffect(() => {
    setLastPeriodClockSnapshot(window.performance.now());
  }, [periodClockSnapshot]);

  // Allow intermission to start when the period is almost over
  useEffect(() => {
    const remaining =
      periodClockSnapshot.alarm! -
      periodClockSnapshot.elapsed -
      (window.performance.now() - lastPeriodClockSnapshot);
    if (remaining < 5000 || ["pregame", "halftime"].includes(gameState)) {
      setIsReady(true);
      return;
    }
    setIsReady(false);

    const timeoutId = setTimeout(() => {
      setIsReady(true);
    }, remaining - 5000);
    return () => clearTimeout(timeoutId);
  }, [periodClockSnapshot, gameState, lastPeriodClockSnapshot]);

  const startIntermission = useCallback(() => {
    const advanceGameState = !["pregame", "final"].includes(gameState);
    dispatch("bout", "startIntermission", {
      boutId,
      latency,
      advanceGameState,
    });
  }, [boutId, latency, gameState]);

  const stopIntermission = useCallback(() => {
    dispatch("bout", "stopIntermission", { boutId, latency });
  }, [boutId, latency]);

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
