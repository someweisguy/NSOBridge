import { useCallback, useState } from "react";
import { getServerTime } from "../lib/sync";
import useServerOffset from "./use-server-offset";

export default function useServerTime(): [Date, () => void] {
  const { offset } = useServerOffset();
  const [serverTime, setServerTime] = useState<Date>(getServerTime(offset));

  // Define a callback that can be used to refresh the clock value
  const refreshServerTime = useCallback(
    () => setServerTime(getServerTime(offset)),
    [offset],
  );

  return [serverTime, refreshServerTime];
}
