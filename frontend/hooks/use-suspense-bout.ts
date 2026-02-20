import { Bout, getBout } from "@/lib/game/bouts";
import { SuspenseQueryOptions } from "@/types/query";
import { useSuspenseQuery } from "@tanstack/react-query";

export const useSuspenseBout = (
  uuid: string,
  options?: Omit<SuspenseQueryOptions<Bout>, "queryKey" | "queryFn">,
) =>
  useSuspenseQuery({
    queryKey: Bout.generateKey(uuid),
    queryFn: () => getBout(uuid),
    ...options,
  });
