import { Bout } from "@/types/bout";
import { Collapse, Stack, StackProps } from "@mantine/core";
import { useBoutOperator } from "../hooks/use-bout-operator";
import BoutPhaseController from "./bout-phase-controller";
import JamStopReasonEditor from "./stop-reason-editor";
import TimeoutEditor from "./timeout-editor";

export interface BoutOperatorProps extends StackProps {
  bout: Bout;
}

// TODO: docs
export default function BoutOperator({ bout, ...props }: BoutOperatorProps) {
  const {
    teams,
    activeJam,
    latestTimeout,
    showJamStopReasonEditor,
    showTimeoutEditor,
    canFinalizeBout,
    canStopPeriod,
  } = useBoutOperator(bout);

  return (
    <Stack mb="lg" w={225} {...props}>
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
