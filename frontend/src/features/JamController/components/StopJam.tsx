import { useCallback, useContext } from "react";
import { BoutIdType } from "../../../types/BoutIdType";
import { BoutIdContext } from "../../../contexts/BoutIdContext";
import { sendQuery, useConnection } from "../../../app/client";

export default function StopJam() {
  const boutId: BoutIdType = useContext(BoutIdContext);
  const { latency } = useConnection();

  const stopJam = useCallback(() => {
    sendQuery("bout", "stopJam", { boutId, latency });
  }, [boutId, latency]);

  return (
    <button
      onClick={stopJam}
      className="px-4 py-2 m-4 text-2xl font-semibold rounded-lg resize-none bg-rose-400 ring-1 ring-rose-500"
    >
      Stop Jam
    </button>
  );
}
