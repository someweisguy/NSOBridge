import { useSuspenseJam } from "@/hooks/use-suspense-jam";
import { TextProps } from "@mantine/core";

import { useSuspenseRuleset } from "@/hooks/use-suspense-ruleset";
import { JamUri } from "@/types/query";
import { JamClock } from "./jam-clock";

// Default strings to display for the various reason a Jam can be stopped.
const stopReasonTexts = {
  called: "Called",
  elapsed: "Time",
  injury: "Injury",
  other: "-",
};

/**
 * Display a component representing the desired Jam's status. If the Jam has not yet
 * started or if the Jam is running a clock is displayed. If the Jam has ended, a string
 * representing the reason that the Jam was stopped is displayed.
 */
export default function JamClockContainer({
  boutUuid,
  periodNum,
  jamNum,
  ...props
}: JamUri & TextProps) {
  const { data: ruleset } = useSuspenseRuleset({ boutUuid });
  const { data: jam } = useSuspenseJam({ boutUuid, periodNum, jamNum });

  const stopReason = jam.stopReason ?? "other";

  return (
    <JamClock
      alarm={ruleset.jamDuration}
      isStopped={jam.stopTimestamp != null}
      stopReasonText={stopReasonTexts[stopReason]}
      {...jam}
      {...props}
    />
  );
}
