import queryClient from "@/lib/cache";
import { SyncData } from "@/types/ws";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { getServerTime, getSyncData } from "../lib/sync";

const syncQueryKey = ["useServerTimeReactHook"];
const REFETCH_INTERVAL = 1000 * 60 * 5;

export const useSuspenseServerTime = (): [Date, () => void] => {
  const {
    data: { offset },
  } = useSuspenseQuery<SyncData>({
    queryKey: syncQueryKey,
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

export const usePrefetchServerTime = () =>
  void queryClient.prefetchQuery({
    queryKey: syncQueryKey,
    queryFn: () => getSyncData(),
  });
