import { useBeginPeriod } from "@/features/bouts/hooks/use-begin-period";
import { useEndPeriod } from "@/features/bouts/hooks/use-end-period";
import { useStartJam } from "@/features/bouts/hooks/use-start-jam";
import { useStartTimeout } from "@/features/bouts/hooks/use-start-timeout";
import { useStopJam } from "@/features/bouts/hooks/use-stop-jam";
import { useStopTimeout } from "@/features/bouts/hooks/use-stop-timeout";
import JamStopReasonEditor from "@/features/jams/components/stop-reason-editor";
import TimeoutCallerEditor from "@/features/timeouts/components/timeout-caller-editor";
import TimeoutRetainedEditor from "@/features/timeouts/components/timeout-retained-editor";
import TimeoutTypeEditor from "@/features/timeouts/components/timeout-type-editor";
import { BoutStateString } from "@/types/bout";
import { StopReasonString } from "@/types/jam";
import { BoutUri, JamUri, TimeoutUri } from "@/types/query";
import {
  Button,
  Collapse,
  Divider,
  Group,
  SegmentedControlItem,
} from "@mantine/core";
import { useCallback } from "react";

interface BoutControlProps {
  /**
   * The UUID of the Bout.
   */
  uuid: string;
  /**
   * The Teams competing in the Bout formatted as a value/label pair where value is team
   * number and label is the team name to display.
   */
  teamData: SegmentedControlItem<string>[];
  /**
   * The state of the Bout.
   */
  state: BoutStateString;
  /**
   * The reason that the previous Jam was stopped.
   */
  stopReason: StopReasonString | null;
  /**
   * The number of the Team which called the current Timeout.
   */
  teamNum?: number | null;
  /**
   * True if the current Timeout was called by officials.
   */
  teamIsOfficials?: boolean;
  /**
   * True if the current Timeout is an official review.
   */
  isReview?: boolean;
  /**
   * True if the current Timeout is retained.
   */
  retained?: boolean;
  /**
   * The number of the latest Period.
   */
  latestPeriodNum: number;
  /**
   * The number of the latest Jam.
   */
  latestJamNum: number;
  /**
   * The number of the latest Timeout.
   */
  latestTimeoutNum?: number;
}

export default function BoutControl({
  uuid,
  state,
  teamData,
  stopReason,
  isReview,
  retained,
  teamNum,
  teamIsOfficials,
  latestPeriodNum,
  latestJamNum,
  latestTimeoutNum,
}: BoutControlProps) {
  const boutUri: BoutUri = { boutUuid: uuid };
  const latestJamUri: JamUri = {
    boutUuid: uuid,
    periodNum: latestPeriodNum,
    jamNum: latestJamNum,
  };
  const latestTimeoutUri: TimeoutUri = {
    boutUuid: uuid,
    timeoutNum: latestTimeoutNum ?? -1,
  };

  // Jam controls
  const startJam = useStartJam(boutUri);
  const stopJam = useStopJam(boutUri);
  const jamControlOnClick = useCallback(
    () => (state == "jam" ? stopJam.mutate() : startJam.mutate()),
    [state, startJam, stopJam],
  );

  // Timeout controls
  const startTimeout = useStartTimeout(boutUri);
  const stopTimeout = useStopTimeout(boutUri);
  const timeoutControlOnClick = useCallback(
    () => (state == "timeout" ? stopTimeout.mutate() : startTimeout.mutate()),
    [state, stopTimeout, startTimeout],
  );

  // Period controls
  const beginPeriod = useBeginPeriod(boutUri);
  const endPeriod = useEndPeriod(boutUri);
  const periodControlOnClick = useCallback(
    () => (state == "stopped" ? beginPeriod.mutate() : endPeriod.mutate()),
    [state, beginPeriod, endPeriod],
  );

  return (
    <Group
      grow
      preventGrowOverflow={false}
      wrap="nowrap"
      justify="space-between"
    >
      <Group align="center" p="0">
        <Button onClick={jamControlOnClick}>
          {state == "jam" ? "Stop Jam" : "Start Jam"}
        </Button>
        <Button
          disabled={state != "lineup" && state != "timeout"}
          onClick={timeoutControlOnClick}
        >
          {state == "timeout" ? "End Timeout" : "Call Timeout"}
        </Button>
        <Button
          disabled={state == "jam" || state == "timeout"}
          onClick={periodControlOnClick}
        >
          {state == "stopped" ? "Start Period" : "Stop Period"}
        </Button>
      </Group>
      <Divider orientation="vertical" />
      <Collapse expanded={state == "timeout"}>
        <Group grow preventGrowOverflow={false} wrap="nowrap">
          <TimeoutTypeEditor
            timeoutUri={latestTimeoutUri}
            isReview={isReview!}
          />
          <TimeoutCallerEditor
            timeoutUri={latestTimeoutUri}
            isReview={isReview!}
            teamNum={teamNum!}
            teamIsOfficials={teamIsOfficials!}
            data={teamData}
          />
          <TimeoutRetainedEditor
            timeoutUri={latestTimeoutUri}
            isReview={isReview!}
            retained={retained!}
            variant="outline"
          />
        </Group>
      </Collapse>
      <Collapse expanded={state == "lineup" && latestJamUri.jamNum > 0}>
        <JamStopReasonEditor stopReason={stopReason} />
      </Collapse>
    </Group>
  );
}
