import { getRuleset, Ruleset } from "@/lib/game/ruleset";
import { BoutUri, SuspenseQueryOptions } from "@/types/query";
import { useSuspenseQuery } from "@tanstack/react-query";

export const useSuspenseRuleset = ({
  boutUuid,
  ...options
}: BoutUri & Omit<SuspenseQueryOptions<Ruleset>, "queryKey" | "queryFn">) =>
  useSuspenseQuery<Ruleset>({
    queryKey: Ruleset.generateKey(boutUuid),
    queryFn: () => getRuleset(boutUuid),
    ...options,
  });
