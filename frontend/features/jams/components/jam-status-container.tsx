import { useSuspenseJam } from "@/hooks/use-suspense-jam";
import { TextProps } from "@mantine/core";

import { useSuspenseRuleset } from "@/hooks/use-suspense-ruleset";
import { JamStatus } from "./jam-status";

interface JamStatusContainerProps extends TextProps {
  boutUuid: string;
  periodNum: number;
  jamNum: number;
  serverOffset?: number;
}

export default function JamStatusContainer({
  boutUuid,
  periodNum,
  jamNum,
  ...props
}: JamStatusContainerProps) {
  const { data: ruleset } = useSuspenseRuleset(boutUuid);
  const { data: jam } = useSuspenseJam(boutUuid, periodNum, jamNum);

  return (
    <JamStatus
      alarm={ruleset.jamDuration}
      isStopped={jam.stopTimestamp != null}
      {...jam}
      {...props}
    />
  );
}
