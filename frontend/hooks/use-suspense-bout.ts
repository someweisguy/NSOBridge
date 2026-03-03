import { Bout, getBout } from "@/lib/game/bouts";
import { BoutUri, SuspenseQueryOptions } from "@/types/query";
import { useSuspenseQuery } from "@tanstack/react-query";

export const useSuspenseBout = ({
  boutUuid,
  ...options
}: BoutUri & Omit<SuspenseQueryOptions<Bout>, "queryKey" | "queryFn">) =>
  useSuspenseQuery({
    queryKey: Bout.generateKey(boutUuid),
    queryFn: () => getBout(boutUuid),
    ...options,
  });
