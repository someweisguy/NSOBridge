import { Ruleset } from "@/types/game";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Bout, getRulesetContext } from "../lib/game/bouts";

export default function useRuleset(key: number): Ruleset {
  const { data } = useSuspenseQuery<Ruleset>({
    queryKey: Bout.generateKey(key).concat("context"),
    queryFn: () => getRulesetContext(key),
  });

  return data;
}
