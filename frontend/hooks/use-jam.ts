import { Bout } from "@/lib/game/bouts";
import { getJam, Jam } from "@/lib/game/jams";
import { QueryOptions } from "@/types/query";
import { useQuery } from "@tanstack/react-query";

export const useJam = <T = null>(
  bout: Bout,
  periodNum: number,
  jamNum: number,
  options?: Omit<QueryOptions<Jam | T>, "queryKey" | "queryFn">,
) =>
  useQuery<Jam | T>({
    queryKey: Jam.generateKey(bout.uuid, periodNum, jamNum),
    queryFn: () => getJam(bout.uuid, periodNum, jamNum),
    ...options,
  });
