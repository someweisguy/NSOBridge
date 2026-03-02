import { useSuspenseJam } from "@/hooks/use-suspense-jam";
import { TextProps } from "@mantine/core";

import { useSuspenseRuleset } from "@/hooks/use-suspense-ruleset";
import { StopReasonString } from "@/lib/game/jams";
import { JamStatus } from "../../../components/jam-status";

interface JamStatusContainerProps extends TextProps {
  /**
   * The desired Bout UUID.
   */
  boutUuid: string;
  /**
   * The Period number of the desired Jam.
   */
  periodNum: number;
  /**
   * The Jam number of the desired Jam.
   */
  jamNum: number;
  /**
   * An object containing the stop reason texts.
   */
  stopReasonTexts?: Record<StopReasonString, string>;
  /**
   * The offset in time in milliseconds between the server and the host.
   */
  serverOffset?: number;
}

/**
 * Fetch server data and display the status of the desired Jam.
 */
export default function JamStatusContainer({
  boutUuid,
  periodNum,
  jamNum,
  stopReasonTexts = {
    called: "Called",
    elapsed: "Time",
    injury: "Injury",
    other: "-",
  },
  ...props
}: JamStatusContainerProps) {
  const { data: ruleset } = useSuspenseRuleset(boutUuid);
  const { data: jam } = useSuspenseJam(boutUuid, periodNum, jamNum);

  const stopReason = jam.stopReason ?? "other";

  return (
    <JamStatus
      alarm={ruleset.jamDuration}
      isStopped={jam.stopTimestamp != null}
      stopReasonText={stopReasonTexts[stopReason]}
      {...jam}
      {...props}
    />
  );
}
