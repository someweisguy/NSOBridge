import { useCallback, useContext } from "react";
import { BoutIdType } from "../../../types/BoutIdType";
import { BoutIdContext } from "../../../contexts/BoutIdContext";
import { useSocketState } from "../../../app/hooks/useConnection";
import dispatch from "../../../app/client";
import Button from "../../../components/Button";

export default function StartJam() {
  const boutId: BoutIdType = useContext(BoutIdContext);
  const { latency } = useSocketState();

  const startJam = useCallback(() => {
    dispatch("bout", "startJam", { boutId, latency });
  }, [boutId, latency]);

  return (
    <Button onClick={startJam} color="green">Start Jam</Button>
  );
}
