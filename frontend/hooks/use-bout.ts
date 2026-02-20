import { Bout, getBout } from "@/lib/game/bouts";
import { QueryOptions } from "@/types/query";
import { useQuery } from "@tanstack/react-query";

export const useBout = <T = null>(
  uuid: string,
  options?: Omit<QueryOptions<Bout | T>, "queryKey" | "queryFn">,
) =>
  useQuery({
    queryKey: Bout.generateKey(uuid),
    queryFn: () => getBout(uuid),
    ...options,
  });
