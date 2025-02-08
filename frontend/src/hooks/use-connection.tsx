import { onlineManager, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import dispatch from "../app/client";

export function useConnection() {
  const [isOnline, setIsOnline] = useState(onlineManager.isOnline());

  useEffect(() => {
    return onlineManager.subscribe((onlineState) => {
      setIsOnline(onlineState);
    });
  }, []);

  const { data } = useQuery<number>({
    queryKey: ["latency"],
    initialData: 0,
    refetchInterval: 10000,
    queryFn: async () => {
      const latencyIterations: number = 5;
      let latencySum: number = 0;
      let successes: number = latencyIterations;
      for (let i = 0; i < latencyIterations; i++) {
        let success: boolean = true;

        // Time the round-trip duration of a packet
        const start: number = window.performance.now();
        await dispatch<void>("server", "latency").catch(() => {
          success = false;
        });
        const stop: number = window.performance.now();

        if (success) {
          latencySum += stop - start;
        } else {
          successes--;
        }
      }

      // Compute one-way latency (in milliseconds) using mathematical average
      return successes > 0 ? Math.round(latencySum / successes / 2) : 0;
    },
  });

  return { latency: data, isOnline };
}
