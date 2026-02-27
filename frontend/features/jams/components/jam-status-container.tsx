import { useSuspenseJam } from "@/hooks/use-suspense-jam";
import { Bout } from "@/lib/game/bouts";
import { TextProps } from "@mantine/core";

import { useSuspenseRuleset } from "@/hooks/use-suspense-ruleset";
import { JamStatus } from "./jam-status";

interface JamStatusProps extends TextProps {
  bout: Bout;
  periodNum: number;
  jamNum: number;
}

export default function JamStatusContainer({
  bout,
  periodNum,
  jamNum,
  ...props
}: JamStatusProps) {
  const { data: ruleset } = useSuspenseRuleset(bout);
  const { data: jam } = useSuspenseJam(bout, periodNum, jamNum);

  return <JamStatus alarm={ruleset.jamDuration} {...jam} {...props} />;
}
