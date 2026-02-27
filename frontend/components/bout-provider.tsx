import { useSuspenseBout } from "@/hooks/use-suspense-bout";
import { useSuspenseRuleset } from "@/hooks/use-suspense-ruleset";
import { BoutContext, RulesetContext } from "@/utils/contexts";
import { PropsWithChildren } from "react";

interface BoutProviderProps extends PropsWithChildren {
  boutUuid: string;
}

export default function BoutProvider({
  boutUuid,
  children,
}: BoutProviderProps) {
  const { data: bout } = useSuspenseBout(boutUuid);
  const { data: ruleset } = useSuspenseRuleset(bout);
  return (
    <BoutContext value={bout}>
      <RulesetContext value={ruleset}>{children}</RulesetContext>
    </BoutContext>
  );
}
