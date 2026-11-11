import { BoutStateString } from "@/types/bout";
import {
  Button,
  ButtonProps,
  Collapse,
  Divider,
  Fieldset,
  FieldsetProps,
  px,
  Stack,
} from "@mantine/core";
import { IconFlag } from "@tabler/icons-react";
import { useFinalizeBout } from "../hooks/use-finalize-bout";
import JamStartStopButton from "./jam-start-stop-button";
import PeriodStartStopButton from "./period-start-stop-button";
import TimeoutStartStopButton from "./timeout-start-stop-button";

const sharedButtonProps: ButtonProps & { iconSize: number } = {
  size: "xs",
  w: "100%",
  justify: "space-between",
  iconSize: 16,
};

export interface BoutPhaseControllerProps extends FieldsetProps {
  boutUuid: string;
  boutState: BoutStateString;
  showFinalizeBout: boolean;
}

/**
 * Control the current phase of the Bout. This component is analogous to blowing
 * the whistle to start the Period, Jam, or to call Timeouts.
 *
 * The primary button is highlighted to indicate the most likely next phase in
 * the Bout, i.e. when the Bout is in lineup starting the next Jam is more
 * likely to occur than calling a Timeout so the "Start Jam" button is made
 * the primary.
 */
export default function BoutPhaseController({
  boutUuid,
  boutState,
  showFinalizeBout,
  ...props
}: BoutPhaseControllerProps) {
  const { mutate: finalizeBout } = useFinalizeBout({ uuid: boutUuid });

  const canStartStopJam = boutState != "final";
  const canStartStopPeriod = ["stopped", "lineup"].includes(boutState);
  const canStartStopTimeout = !["stopped", "final"].includes(boutState);

  return (
    <Fieldset legend="Bout Controls" {...props}>
      <Stack justify="start" align="stretch">
        <JamStartStopButton
          boutUuid={boutUuid}
          jamIsRunning={boutState == "jam"}
          disabled={!canStartStopJam}
          variant={
            ["lineup", "jam"].includes(boutState) ? "outline" : "default"
          }
          {...sharedButtonProps}
        />
        <TimeoutStartStopButton
          boutUuid={boutUuid}
          timeoutIsRunning={boutState == "timeout"}
          disabled={!canStartStopTimeout}
          variant={boutState == "timeout" ? "outline" : "default"}
          {...sharedButtonProps}
        />

        <PeriodStartStopButton
          boutUuid={boutUuid}
          periodIsRunning={boutState != "stopped"}
          disabled={!canStartStopPeriod}
          variant={boutState == "stopped" ? "outline" : "default"}
          {...sharedButtonProps}
        />

        <Collapse expanded={showFinalizeBout}>
          <Divider pb="md" />
          <Button
            variant="filled"
            color="red"
            onClick={() => finalizeBout()}
            disabled={!showFinalizeBout}
            rightSection={<IconFlag size={px(sharedButtonProps.iconSize)} />}
            {...sharedButtonProps}
          >
            Finalize Bout
          </Button>
        </Collapse>
      </Stack>
    </Fieldset>
  );
}
