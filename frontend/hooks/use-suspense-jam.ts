import { Bout } from "@/lib/game/bouts";
import { getJam, Jam } from "@/lib/game/jams";
import { SuspenseQueryOptions } from "@/types/query";
import { useSuspenseQuery } from "@tanstack/react-query";

export const useSuspenseJam = (
  bout: Bout,
  periodNum: number,
  jamNum: number,
  options?: SuspenseQueryOptions<Jam>,
) =>
  useSuspenseQuery<Jam>({
    queryKey: Jam.generateKey(bout.uuid, periodNum, jamNum),
    queryFn: () => getJam(bout.uuid, periodNum, jamNum),
    ...options,
  });
