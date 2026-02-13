import { Bout } from "@/lib/game/bouts";
import { getJam, Jam } from "@/lib/game/jams";
import {
  useQuery,
  UseQueryOptions,
  useSuspenseQuery,
  UseSuspenseQueryOptions,
} from "@tanstack/react-query";

export const useSuspenseJam = (
  bout: Bout,
  periodNum: number,
  jamNum: number,
  options?: Omit<UseSuspenseQueryOptions<Jam>, "queryKey" | "queryFn">,
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
  options?: Omit<UseQueryOptions<Jam | T>, "queryKey" | "queryFn">,
) =>
  useQuery<Jam | T>({
    queryKey: Jam.generateKey(bout.uuid, periodNum, jamNum),
    queryFn: () => getJam(bout.uuid, periodNum, jamNum),
    ...options,
  });
