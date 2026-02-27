import { getJam, Jam } from "@/lib/game/jams";
import { SuspenseQueryOptions } from "@/types/query";
import { useSuspenseQuery } from "@tanstack/react-query";

export const useSuspenseJam = <D = Jam, E = Error>(
  boutUuid: string,
  periodNum: number,
  jamNum: number,
  options?: SuspenseQueryOptions<Jam, E, D>,
) =>
  useSuspenseQuery<Jam, E, D>({
    queryKey: Jam.generateKey(boutUuid, periodNum, jamNum),
    queryFn: () => getJam(boutUuid, periodNum, jamNum),
    ...options,
  });
