import { getJam, Jam } from "@/lib/game/jams";
import { JamUri, SuspenseQueryOptions } from "@/types/query";
import { useSuspenseQuery } from "@tanstack/react-query";

export const useSuspenseJam = <D = Jam, E = Error>({
  boutUuid,
  periodNum,
  jamNum,
  ...options
}: JamUri & Omit<SuspenseQueryOptions<Jam, E, D>, "queryKey" | "queryFn">) =>
  useSuspenseQuery<Jam, E, D>({
    queryKey: Jam.generateKey(boutUuid, periodNum, jamNum),
    queryFn: () => getJam(boutUuid, periodNum, jamNum),
    ...options,
  });
