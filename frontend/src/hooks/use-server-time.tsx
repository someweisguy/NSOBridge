import { getServerTime, getSyncData } from "@/lib/sync";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const INTERVAL_PERIOD = 50;

export default function useServerTime(
  run: boolean,
  clientTime: Date = new Date()
) {
  const { data } = useSuspenseQuery({
    queryKey: ["useServerTimeReactHook"],
    queryFn: getSyncData,
    select: (syncData) => syncData.offset,
    refetchInterval: 1000 * 60 * 5,
  });
  const [serverTime, setServerTime] = useState<Date>(
    getServerTime(data, clientTime)
  );

  useEffect(() => {
    if (!run) {
      return;
    }

    const intervalId = setInterval(() => {
      setServerTime(getServerTime(data, clientTime));
    }, INTERVAL_PERIOD);

    return () => {
      clearInterval(intervalId);
    };
  }, [data, run, clientTime]);

  return serverTime;
}
