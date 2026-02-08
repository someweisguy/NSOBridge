import { useSuspenseRuleset } from "@/hooks/use-ruleset";
import { Bout } from "@/lib/game/bouts";
import { RulesetContext } from "@/utils/contexts";
import { PropsWithChildren } from "react";

interface RulesetProviderProps extends PropsWithChildren {
  bout: Bout;
}

export default function RulesetProvider({
  bout,
  children,
}: RulesetProviderProps) {
  const { data: ruleset } = useSuspenseRuleset(bout);
  return <RulesetContext value={ruleset}>{children}</RulesetContext>;
}
