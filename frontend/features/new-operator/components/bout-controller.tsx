import { Bout } from "@/types/bout";
import {
  Button,
  ButtonProps,
  Collapse,
  Divider,
  Fieldset,
  FieldsetProps,
  Stack,
} from "@mantine/core";
import {
  IconAlarm,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerStop,
  IconProps,
  IconRollerSkating,
} from "@tabler/icons-react";
import { useCallback } from "react";
import { useBeginPeriod } from "../hooks/use-begin-period";
import { useEndPeriod } from "../hooks/use-end-period";
import { useFinalizeBout } from "../hooks/use-finalize-bout";
import { useStartJam } from "../hooks/use-start-jam";
import { useStartTimeout } from "../hooks/use-start-timeout";
import { useStopJam } from "../hooks/use-stop-jam";
import { useStopTimeout } from "../hooks/use-stop-timeout";

const buttonIconProps: IconProps = {
  size: 16,
};

const sharedButtonProps: ButtonProps = {
  size: "xs",
  w: "100%",
  justify: "space-between",
};

export interface BoutControllerProps extends FieldsetProps {
  bout: Bout;
}

export default function BoutController({
  bout,
  ...props
}: BoutControllerProps) {
  // Handle start/stop Jam
  const { mutate: startJam } = useStartJam({ ...bout });
  const { mutate: stopJam } = useStopJam({ ...bout });
  const startStopJam = useCallback(
    () => (bout.state == "jam" ? stopJam() : startJam()),
    [bout.state, startJam, stopJam],
  );

  // Handle start/stop Timeout
  const { mutate: startTimeout } = useStartTimeout({ ...bout });
  const { mutate: stopTimeout } = useStopTimeout({ ...bout });
  const startStopTimeout = useCallback(
    () => (bout.state == "timeout" ? stopTimeout() : startTimeout()),
    [bout.state, startTimeout, stopTimeout],
  );

  // Handle start/stop Period
  const { mutate: startPeriod } = useBeginPeriod({ ...bout });
  const { mutate: stopPeriod } = useEndPeriod({ ...bout });
  const startStopPeriod = useCallback(
    () => (bout.state == "stopped" ? startPeriod() : stopPeriod()),
    [bout.state, startPeriod, stopPeriod],
  );
  const canStartStopPeriod = ["stopped", "lineup"].includes(bout.state);

  // Handle finalizing Bout
  const { mutate: finalizeBout } = useFinalizeBout({ ...bout });
  const canFinalizeBout =
    bout.state == "stopped" && bout.jamUuids[1].length > 0; // TODO: magic number

  return (
    <Fieldset legend="Bout Controls" {...props}>
      <Stack justify="start" align="stretch">
        {/* TODO: Start/Stop Jam */}
        <Button
          variant="outline"
          color="teal"
          onClick={() => startStopJam()}
          rightSection={
            bout.state == "jam" ? (
              <IconPlayerPause {...buttonIconProps} />
            ) : (
              <IconPlayerPlay {...buttonIconProps} />
            )
          }
          {...sharedButtonProps}
        >
          Start Jam
        </Button>
        {/* TODO: Call/Finish Timeout */}
        <Button
          variant="outline"
          color="yellow"
          onClick={() => startStopTimeout()}
          rightSection={<IconAlarm {...buttonIconProps} />}
          {...sharedButtonProps}
        >
          Call Timeout
        </Button>
        {/* TODO: Begin/End Period */}
        <Button
          variant="default"
          onClick={() => startStopPeriod()}
          disabled={!canStartStopPeriod}
          rightSection={
            bout.state == "stopped" ? (
              <IconRollerSkating {...buttonIconProps} />
            ) : (
              <IconPlayerStop {...buttonIconProps} />
            )
          }
          {...sharedButtonProps}
        >
          Begin Period
        </Button>
        <Collapse expanded={canFinalizeBout}>
          {/* TODO: Finalize Bout */}
          <Divider pb="md" />
          <Button
            variant="filled"
            color="red"
            onClick={() => finalizeBout()}
            disabled={!canFinalizeBout}
            {...sharedButtonProps}
          >
            Finalize Bout
          </Button>
        </Collapse>
      </Stack>
    </Fieldset>
  );
}
