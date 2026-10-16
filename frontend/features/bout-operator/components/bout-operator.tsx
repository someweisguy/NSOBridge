import useSuspenseActiveJam from "@/hooks/game/use-active-jam";
import useLatestTimeout from "@/hooks/game/use-latest-timeout";
import { Bout } from "@/types/bout";
import { Collapse, Divider, Stack, StackProps } from "@mantine/core";
import BoutClock from "./bout-clock";
import BoutPhaseController from "./bout-phase-controller";
import JamStopReasonEditor from "./stop-reason-editor";
import TimeoutEditor from "./timeout-editor";

export interface BoutControllerProps extends StackProps {
  bout: Bout;
}

export default function BoutController({
  bout,
  ...props
}: BoutControllerProps) {
  const { data: activeJam } = useSuspenseActiveJam(bout);
  const { data: latestTimeout } = useLatestTimeout(bout);

  return (
    <Stack mb="lg" w={225} {...props}>
      <Stack gap="0" w="100%">
        <BoutClock bout={bout} />
        <Divider />
      </Stack>
      <Stack justify="start" align="stretch" px="xs">
        <BoutPhaseController bout={bout} p="xs" />
        <Collapse expanded={activeJam.stopTimestamp != null}>
          <JamStopReasonEditor jam={activeJam} p="xs" />
        </Collapse>
        <Collapse expanded={bout.state == "timeout" && latestTimeout != null}>
          <TimeoutEditor timeout={latestTimeout!} p="xs" />
        </Collapse>
      </Stack>
    </Stack>
  );
}
