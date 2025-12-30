import { Bout } from "@/lib/game/bouts";
import { getRuleset, Ruleset } from "@/lib/game/ruleset";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

export const useSuspenseRuleset = (bout: Bout) =>
  useSuspenseQuery<Ruleset>({
    queryKey: Ruleset.generateKey(bout.ruleset_name),
    queryFn: () => getRuleset(bout.id),
  });

export const useRuleset = (bout: Bout) =>
  useQuery<Ruleset>({
    queryKey: Ruleset.generateKey(bout.ruleset_name),
    queryFn: () => getRuleset(bout.id),
  });
