import { useRuleset } from "@/hooks/use-ruleset";
import { Bout } from "@/types/bout";
import { Collapse, Divider, Stack, StackProps } from "@mantine/core";
import { useBoutOperator } from "../hooks/use-bout-operator";
import BoutClock from "./bout-clock";
import BoutPhaseController from "./bout-phase-controller";
import JamStopReasonEditor from "./stop-reason-editor";
import TimeoutEditor from "./timeout-editor";

export interface BoutOperatorProps extends StackProps {
  bout: Bout;
}

// TODO: docs
export default function BoutOperator({ bout, ...props }: BoutOperatorProps) {
  const { data: ruleset } = useRuleset({ uuid: bout.uuid });

  const {
    teams,
    activeJam,
    periodNum,
    jamNum,
    lastEventTimestamp,
    latestTimeout,
    showJamStopReasonEditor,
    showTimeoutEditor,
    canFinalizeBout,
    canStopPeriod,
  } = useBoutOperator(bout);

  return (
    <Stack mb="lg" w={225} {...props}>
      <Stack gap="0" w="100%" justify="start">
        <BoutClock
          boutClock={bout.clock}
          boutState={bout.state}
          boutSubState={bout.subState}
          periodNum={periodNum}
          jamNum={jamNum}
          jamStopReason={activeJam?.stopReason}
          lastEventTimestamp={lastEventTimestamp}
          jamDuration={ruleset?.jamDuration}
          showJamClock={!showJamStopReasonEditor}
          h="6.5rem"
        />
        <Divider />
      </Stack>
      <Stack justify="start" align="stretch" px="xs">
        <BoutPhaseController
          boutUuid={bout.uuid}
          boutState={bout.state}
          boutSubState={bout.subState}
          showFinalizeBout={canFinalizeBout}
          canStopPeriod={canStopPeriod}
          p="xs"
        />
        <Collapse expanded={showJamStopReasonEditor}>
          <JamStopReasonEditor
            jamUuid={activeJam?.uuid}
            stopReason={activeJam?.stopReason}
            p="xs"
          />
        </Collapse>
        <Collapse expanded={showTimeoutEditor}>
          <TimeoutEditor
            timeoutUuid={latestTimeout?.uuid}
            isReview={latestTimeout?.isReview}
            teamIsOfficials={latestTimeout?.teamIsOfficials}
            teamUuid={latestTimeout?.teamUuid}
            retained={latestTimeout?.retained}
            teams={teams}
            p="xs"
          />
        </Collapse>
      </Stack>
    </Stack>
  );
}
