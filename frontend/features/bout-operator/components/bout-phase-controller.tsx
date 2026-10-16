import { BoutStateString } from "@/types/bout";
import {
  Button,
  ButtonProps,
  Collapse,
  Divider,
  Fieldset,
  FieldsetProps,
  Stack,
} from "@mantine/core";
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

// TODO: docs
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
          {...sharedButtonProps}
        />
        <TimeoutStartStopButton
          boutUuid={boutUuid}
          timeoutIsRunning={boutState == "timeout"}
          disabled={!canStartStopTimeout}
          {...sharedButtonProps}
        />

        <PeriodStartStopButton
          boutUuid={boutUuid}
          periodIsRunning={boutState != "stopped"}
          disabled={!canStartStopPeriod}
          {...sharedButtonProps}
        />

        <Collapse expanded={showFinalizeBout}>
          <Divider pb="md" />
          <Button
            variant="filled"
            color="red"
            onClick={() => finalizeBout()}
            disabled={!showFinalizeBout}
            {...sharedButtonProps}
          >
            Finalize Bout
          </Button>
        </Collapse>
      </Stack>
    </Fieldset>
  );
}
