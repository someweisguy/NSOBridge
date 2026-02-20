import { Bout, getBout } from "@/lib/game/bouts";
import { QueryOptions, SuspenseQueryOptions } from "@/types/query";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

// TODO: extract to separate file
export const useSuspenseBout = (
  uuid: string,
  options?: Omit<SuspenseQueryOptions<Bout>, "queryKey" | "queryFn">,
) =>
  useSuspenseQuery({
    queryKey: Bout.generateKey(uuid),
    queryFn: () => getBout(uuid),
    ...options,
  });

export const useBout = <T = null>(
  uuid: string,
  options?: Omit<QueryOptions<Bout | T>, "queryKey" | "queryFn">,
) =>
  useQuery({
    queryKey: Bout.generateKey(uuid),
    queryFn: () => getBout(uuid),
    ...options,
  });
