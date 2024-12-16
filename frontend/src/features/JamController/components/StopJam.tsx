import { useCallback, useContext } from "react";
import { BoutIdType } from "../../../types/BoutIdType";
import { BoutIdContext } from "../../../contexts/BoutIdContext";
import dispatch from "../../../app/client";
import { useSocketState } from "../../../app/hooks/useConnection";
import Button from "../../../components/Button";
import Clock from "../../../components/Clock";

export default function StopJam() {
  const boutId: BoutIdType = useContext(BoutIdContext);
  const { latency } = useSocketState();

  const stopJam = useCallback(() => {
    dispatch("bout", "stopJam", { boutId, latency });
  }, [boutId, latency]);

  return (
    <Button onClick={stopJam} color="red">
      <Clock type="jam" />
    </Button>
  );
}
