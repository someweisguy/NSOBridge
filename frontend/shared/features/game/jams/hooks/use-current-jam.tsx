import { Bout } from "@/shared/features/game/bouts/types";
import { getJam, Jam } from "@/shared/features/game/jams/types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

function getCurrentJamCacheKey(bout: Bout): ReturnType<typeof Jam.generateKey> {
  let periodNum = bout.jamCounts.findIndex((elem) => elem === 0) - 1;
  if (periodNum < 0) {
    periodNum = 0;
  }
  let jamNum = bout.jamCounts[periodNum] - 1;
  if (bout.state != "jam" && jamNum > 0) {
    jamNum--;
  }

  return Jam.generateKey(bout.id, periodNum, jamNum);
}

export default function useCurrentJam(bout: Bout): Jam | null {
  const [jamCacheKey, setJamCacheKey] = useState<
    ReturnType<typeof Jam.generateKey>
  >(getCurrentJamCacheKey(bout));

  useEffect(() => {
    setJamCacheKey(getCurrentJamCacheKey(bout));
  }, [bout]);

  const { data } = useSuspenseQuery<Jam | null>({
    queryKey: jamCacheKey,
    queryFn: () => getJam(jamCacheKey),
    select: (jam) => (jam?.hasStarted() ? jam : null),
  });

  return data;
}
