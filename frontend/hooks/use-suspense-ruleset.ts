import { getRuleset, Ruleset } from "@/lib/game/ruleset";
import { SuspenseQueryOptions } from "@/types/query";
import { useSuspenseQuery } from "@tanstack/react-query";

export const useSuspenseRuleset = (
  boutUuid: string,
  options?: Omit<SuspenseQueryOptions<Ruleset>, "queryKey" | "queryFn">,
) =>
  useSuspenseQuery<Ruleset>({
    queryKey: Ruleset.generateKey(boutUuid),
    queryFn: () => getRuleset(boutUuid),
    ...options,
  });
