import { Bout } from "@/lib/game/bouts";
import { getJam, Jam } from "@/lib/game/jams";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

function getLatestJamCacheKey(bout: Bout): ReturnType<typeof Jam.generateKey> {
  let periodNum = bout.jamCounts.findIndex((elem) => elem === 0) - 1;
  if (periodNum < 0) {
    periodNum = 0;
  }
  const jamNum = bout.jamCounts[periodNum] - 1;

  return Jam.generateKey(bout.id, periodNum, jamNum);
}

export default function useLatestJam(bout: Bout): Jam {
  const [jamCacheKey, setJamCacheKey] = useState<
    ReturnType<typeof Jam.generateKey>
  >(getLatestJamCacheKey(bout));

  useEffect(() => {
    setJamCacheKey(getLatestJamCacheKey(bout));
  }, [bout]);

  const { data } = useSuspenseQuery<Jam | null>({
    queryKey: jamCacheKey,
    queryFn: () => getJam(jamCacheKey),
  });

  return data!;
}
