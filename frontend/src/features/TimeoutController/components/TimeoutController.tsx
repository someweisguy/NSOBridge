import { ReactElement, useCallback, useContext } from "react";
import Button from "../../../components/Button";
import { BoutIdType } from "../../../types/BoutIdType";
import { BoutIdContext } from "../../../contexts/BoutIdContext";
import useBout from "../../../hooks/useBout";
import dispatch from "../../../app/client";
import { useSocketState } from "../../../app/hooks/useConnection";
import Clock from "../../../components/Clock";

export default function TimeoutController(): ReactElement {
  const boutId: BoutIdType = useContext(BoutIdContext);

  const gameState = useBout<string>(boutId, (bout) => bout.gameState);
  const { latency } = useSocketState();

  const callTimeout = useCallback(() => {
    dispatch("bout", "callTimeout", { boutId, latency });
  }, [boutId, latency]);

  const endTimeout = useCallback(() => {
    dispatch("bout", "endTimeout", { boutId, latency });
  }, [boutId, latency]);

  if (gameState != "timeout") {
    return (
      <Button onClick={callTimeout} disabled={gameState == "jam"}>
        Call Timeout
      </Button>
    );
  }

  return (
    <Button color="red" onClick={endTimeout}>
      <Clock type="timeout" />
    </Button>
  );
}
