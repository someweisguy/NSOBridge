import { useCallback, useContext } from "react";
import { BoutIdType } from "../../../types/BoutIdType";
import { BoutIdContext } from "../../../contexts/BoutIdContext";
import { useSocketState } from "../../../app/hooks/useConnection";
import dispatch from "../../../app/client";

export default function StartJam() {
  const boutId: BoutIdType = useContext(BoutIdContext);
  const { latency } = useSocketState();

  const startJam = useCallback(() => {
    dispatch("bout", "startJam", { boutId, latency });
  }, [boutId, latency]);

  return (
    <button
      onClick={startJam}
      className="px-4 py-2 m-4 text-2xl font-semibold rounded-lg resize-none bg-lime-400 ring-1 ring-lime-500"
    >
      Start Jam
    </button>
  );
}
