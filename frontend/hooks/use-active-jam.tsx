import { Bout } from "@/lib/game/bouts";
import { getJam, Jam } from "@/lib/game/jams";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

function getActiveJamCacheKey(bout: Bout): ReturnType<typeof Jam.generateKey> {
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

export default function useActiveJam(bout: Bout): Jam | null {
  const [jamCacheKey, setJamCacheKey] = useState<
    ReturnType<typeof Jam.generateKey>
  >(getActiveJamCacheKey(bout));

  useEffect(() => {
    setJamCacheKey(getActiveJamCacheKey(bout));
  }, [bout]);

  const { data } = useSuspenseQuery<Jam | null>({
    queryKey: jamCacheKey,
    queryFn: () => getJam(jamCacheKey),
  });

  return data;
}
