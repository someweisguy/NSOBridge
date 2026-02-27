import { useSuspenseJam } from "@/hooks/use-suspense-jam";
import { Bout } from "@/lib/game/bouts";
import { TextProps } from "@mantine/core";

import { useSuspenseRuleset } from "@/hooks/use-suspense-ruleset";
import { JamStatus } from "./jam-status";

interface JamStatusContainerProps extends TextProps {
  bout: Bout;
  periodNum: number;
  jamNum: number;
  serverOffset?: number;
}

export default function JamStatusContainer({
  bout,
  periodNum,
  jamNum,
  ...props
}: JamStatusContainerProps) {
  const { data: ruleset } = useSuspenseRuleset(bout);
  const { data: jam } = useSuspenseJam(bout.uuid, periodNum, jamNum);

  return (
    <JamStatus
      alarm={ruleset.jamDuration}
      isStopped={jam.stopTimestamp != null}
      {...jam}
      {...props}
    />
  );
}
