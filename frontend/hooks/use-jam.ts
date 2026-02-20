import { Bout } from "@/lib/game/bouts";
import { getJam, Jam } from "@/lib/game/jams";
import { QueryOptions, SuspenseQueryOptions } from "@/types/query";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

// TODO: extract to separate file
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
