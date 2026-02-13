import { Bout, getBout } from "@/lib/game/bouts";
import { QueryOptions, SuspenseQueryOptions } from "@/types/query";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

export const useSuspenseBout = (
  uuid: string,
  options?: SuspenseQueryOptions<Bout>,
) =>
  useSuspenseQuery({
    queryKey: Bout.generateKey(uuid),
    queryFn: () => getBout(uuid),
    ...options,
  });

export const useBout = <T = null>(
  uuid: string,
  options?: QueryOptions<Bout | T>,
) =>
  useQuery({
    queryKey: Bout.generateKey(uuid),
    queryFn: () => getBout(uuid),
    ...options,
  });
