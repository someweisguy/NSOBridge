import { Bout } from "@/shared/lib/game/bouts/types";
import { getJam, Jam } from "@/shared/lib/game/jams/types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

function getUpcomingJamCacheKey(
  bout: Bout,
): ReturnType<typeof Jam.generateKey> {
  let periodNum = bout.jamCounts.findIndex((elem) => elem === 0) - 1;
  if (periodNum < 0) {
    periodNum = 0;
  }
  const jamNum = bout.jamCounts[periodNum] - 1;

  return Jam.generateKey(bout.id, periodNum, jamNum);
}

export default function useUpcomingJam(bout: Bout): Jam | null {
  const [jamCacheKey, setJamCacheKey] = useState<
    ReturnType<typeof Jam.generateKey>
  >(getUpcomingJamCacheKey(bout));

  useEffect(() => {
    setJamCacheKey(getUpcomingJamCacheKey(bout));
  }, [bout]);

  const { data } = useSuspenseQuery<Jam | null>({
    queryKey: jamCacheKey,
    queryFn: () => getJam(jamCacheKey),
    select: (jam) => (jam?.hasStarted() ? null : jam),
  });

  return data;
}
