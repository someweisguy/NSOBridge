import { useSuspenseRuleset } from "@/hooks/use-ruleset";
import { Bout } from "@/lib/game/bouts";
import { BoutContext, RulesetContext } from "@/utils/contexts";
import { PropsWithChildren } from "react";

interface BoutProviderProps extends PropsWithChildren {
  bout: Bout;
}

export default function BoutProvider({ bout, children }: BoutProviderProps) {
  const { data: ruleset } = useSuspenseRuleset(bout);
  return (
    <BoutContext value={bout}>
      <RulesetContext value={ruleset}>{children}</RulesetContext>
    </BoutContext>
  );
}
