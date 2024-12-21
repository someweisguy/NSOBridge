import { ReactElement, useCallback, useContext } from "react";
import { BoutIdType } from "../../../types/BoutIdType";
import { BoutIdContext } from "../../../contexts/BoutIdContext";
import { useSocketState } from "../../../app/hooks/useConnection";
import dispatch from "../../../app/client";
import Button from "../../../components/Button";
import Clock from "../../../components/Clock";
import useBout from "../../../hooks/useBout";

export default function JamController(): ReactElement {
  const boutId: BoutIdType = useContext(BoutIdContext);
  const { latency } = useSocketState();

  const gameState = useBout<string>(boutId, (bout) => bout.gameState);

  const startStopJam = useCallback(() => {
    if (gameState !== "jam") {
      dispatch("bout", "startJam", { boutId, latency });
    } else {
      dispatch("bout", "stopJam", { boutId, latency });
    }
  }, [boutId, gameState, latency]);

  if (gameState !== "jam") {
    return (
      <Button
        disabled={gameState === "timeout"}
        onClick={startStopJam}
        color="green"
      >
        <p className="min-w-20">
          Start Jam{" "}
          {gameState !== "stopped" && (
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
