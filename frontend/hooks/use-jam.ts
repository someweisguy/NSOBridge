import { getJam, Jam } from "@/lib/game/jams";
import { JamUri, QueryOptions } from "@/types/query";
import { useQuery } from "@tanstack/react-query";

export const useJam = <T = null>({
  boutUuid,
  periodNum,
  jamNum,
  ...options
}: JamUri & Omit<QueryOptions<Jam | T>, "queryKey" | "queryFn">) =>
  useQuery<Jam | T>({
    queryKey: Jam.generateKey(boutUuid, periodNum, jamNum),
    queryFn: () => getJam(boutUuid, periodNum, jamNum),
    ...options,
  });
