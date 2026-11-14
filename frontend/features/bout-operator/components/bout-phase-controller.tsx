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
import { IconFlagFilled } from "@tabler/icons-react";
import { useFinalizeBout } from "../hooks/use-finalize-bout";
import JamStartStopButton from "./jam-start-stop-button";
import PeriodStartStopButton from "./period-start-stop-button";
import TimeoutStartStopButton from "./timeout-start-stop-button";

const iconSize = 16;

const sharedButtonProps: ButtonProps = {
  size: "xs",
  w: "100%",
  justify: "space-between",
};

export interface BoutPhaseControllerProps extends FieldsetProps {
  boutUuid: string;
  boutState: BoutStateString;
  showFinalizeBout: boolean;
  canStopPeriod: boolean;
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
  canStopPeriod,
  ...props
}: BoutPhaseControllerProps) {
  const { mutate: finalizeBout } = useFinalizeBout({ uuid: boutUuid });

  const canStartStopJam = boutState != "final";
  const canStartPeriod = boutState == "stopped";
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
          iconSize={iconSize}
          {...sharedButtonProps}
        />
        <TimeoutStartStopButton
          boutUuid={boutUuid}
          timeoutIsRunning={boutState == "timeout"}
          disabled={!canStartStopTimeout}
          variant={boutState == "timeout" ? "outline" : "default"}
          iconSize={iconSize}
          {...sharedButtonProps}
        />

        <PeriodStartStopButton
          boutUuid={boutUuid}
          periodIsRunning={boutState != "stopped"}
          canStartOvertime={showFinalizeBout}
          disabled={!(canStartPeriod || canStopPeriod)}
          variant={
            boutState == "stopped" && showFinalizeBout ? "outline" : "default"
          }
          iconSize={iconSize}
          {...sharedButtonProps}
        />

        <Collapse expanded={showFinalizeBout}>
          <Divider pb="md" />
          <Button
            variant="filled"
            color="red"
            onClick={() => finalizeBout()}
            disabled={!showFinalizeBout}
            rightSection={<IconFlagFilled size={px(iconSize)} />}
            {...sharedButtonProps}
          >
            Finalize Bout
          </Button>
        </Collapse>
      </Stack>
    </Fieldset>
  );
}
