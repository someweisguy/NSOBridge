import { useSuspenseQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { getServerTime, getSyncData } from "../lib/sync";
const REFETCH_INTERVAL = 1000 * 60 * 5;

export const useServerTime = (): [Date, () => void] => {
  const {
    data: { offset },
  } = useSuspenseQuery<{ offset: number; error: number }>({
    queryKey: ["useServerTimeReactHook"],
    queryFn: () => getSyncData(),
    refetchInterval: REFETCH_INTERVAL,
  });
  const [serverTime, setServerTime] = useState<Date>(getServerTime(offset));

  // Define a callback that can be used to refresh the clock value
  const refreshServerTime = useCallback(
    () => setServerTime(getServerTime(offset)),
    [offset],
  );

  return [serverTime, refreshServerTime];
};
