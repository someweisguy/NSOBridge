import { Bout, getBout } from "@/lib/game/bouts";
import { BoutUri, QueryOptions } from "@/types/query";
import { useQuery } from "@tanstack/react-query";

export const useBout = <T = null>({
  boutUuid,
  ...options
}: BoutUri & Omit<QueryOptions<Bout | T>, "queryKey" | "queryFn">) =>
  useQuery({
    queryKey: Bout.generateKey(boutUuid),
    queryFn: () => getBout(boutUuid),
    ...options,
  });
