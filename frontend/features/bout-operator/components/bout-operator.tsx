import useSuspenseActiveJam from "@/hooks/game/use-active-jam";
import useLatestTimeout from "@/hooks/game/use-latest-timeout";
import { Bout } from "@/types/bout";
import { Collapse, Divider, Stack, StackProps } from "@mantine/core";
import BoutClock from "./bout-clock";
import BoutPhaseController from "./bout-phase-controller";
import JamStopReasonEditor from "./stop-reason-editor";
import TimeoutEditor from "./timeout-editor";

export interface BoutOperatorProps extends StackProps {
  bout: Bout;
}

export default function BoutOperator({ bout, ...props }: BoutOperatorProps) {
  const { data: activeJam } = useSuspenseActiveJam(bout);
  const { data: latestTimeout } = useLatestTimeout(bout);

  const showJamStopReasonEditor = activeJam.stopTimestamp != null;
  const showTimeoutEditor = bout.state == "timeout" && latestTimeout != null;

  return (
    <Stack mb="lg" w={225} {...props}>
      <Stack gap="0" w="100%">
        <BoutClock bout={bout} />
        <Divider />
      </Stack>
      <Stack justify="start" align="stretch" px="xs">
        <BoutPhaseController
          boutUuid={bout.uuid}
          boutState={bout.state}
          showFinalizeBout={false} // TODO: figure out business logic for this
          p="xs"
        />
        <Collapse expanded={showJamStopReasonEditor}>
          <JamStopReasonEditor
            uuid={activeJam.uuid}
            stopReason={activeJam.stopReason}
            p="xs"
          />
        </Collapse>
        <Collapse expanded={showTimeoutEditor}>
          <TimeoutEditor
            p="xs"
            timeoutUuid={latestTimeout!.uuid}
            boutUuid={latestTimeout!.boutUuid}
            isReview={latestTimeout!.isReview}
            teamIsOfficials={latestTimeout!.teamIsOfficials}
            teamUuid={latestTimeout!.teamUuid}
            retained={latestTimeout!.retained}
          />
        </Collapse>
      </Stack>
    </Stack>
  );
}
