import { getJam, Jam } from "@/lib/game/jams";
import { QueryOptions } from "@/types/query";
import { useQuery } from "@tanstack/react-query";

export const useJam = <T = null>(
  boutUuid: string,
  periodNum: number,
  jamNum: number,
  options?: Omit<QueryOptions<Jam | T>, "queryKey" | "queryFn">,
) =>
  useQuery<Jam | T>({
    queryKey: Jam.generateKey(boutUuid, periodNum, jamNum),
    queryFn: () => getJam(boutUuid, periodNum, jamNum),
    ...options,
  });
