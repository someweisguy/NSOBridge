import { Bout, BoutContext } from "@/types/game";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getRulesetContext } from "../lib/game/bouts";

export default function useRulesetContext(key: number): BoutContext {
  const { data } = useSuspenseQuery<BoutContext>({
    queryKey: Bout.generateKey(key).concat("context"),
    queryFn: () => getRulesetContext(key),
  });

  return data;
}
