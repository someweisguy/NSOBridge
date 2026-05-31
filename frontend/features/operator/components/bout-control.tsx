import { useBeginPeriod } from "@/features/operator/hooks/use-begin-period";
import { useEndPeriod } from "@/features/operator/hooks/use-end-period";
import { useStartJam } from "@/features/operator/hooks/use-start-jam";
import { useStartTimeout } from "@/features/operator/hooks/use-start-timeout";
import { useStopJam } from "@/features/operator/hooks/use-stop-jam";
import { useStopTimeout } from "@/features/operator/hooks/use-stop-timeout";
import { BoutStateString } from "@/types/bout";
import { BoutUri } from "@/types/query";
import { Button, Fieldset, FieldsetProps, Stack } from "@mantine/core";
import {
  IconAlarm,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerStop,
  IconRollerSkating,
} from "@tabler/icons-react";
import { useCallback } from "react";

interface BoutControlProps extends FieldsetProps {
  boutUri: BoutUri;
  state: BoutStateString;
}

export default function BoutControl({
  state,
  boutUri,
  ...props
}: BoutControlProps) {
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
    <Fieldset legend="Bout Controls" {...props}>
      <Stack>
        <Button
          size="xs"
          variant="default"
          onClick={jamControlOnClick}
          rightSection={
            state == "jam" ? (
              <IconPlayerPause size={16} />
            ) : (
              <IconPlayerPlay size={16} />
            )
          }
        >
          {state == "jam" ? "Stop Jam" : "Start Jam"}
        </Button>
        <Button
          size="xs"
          variant="default"
          disabled={state != "lineup" && state != "timeout"}
          onClick={timeoutControlOnClick}
          rightSection={<IconAlarm size={16} />}
        >
          {state == "timeout" ? "End Timeout" : "Call Timeout"}
        </Button>
        <Button
          size="xs"
          color={state == "stopped" ? "green.8" : "red"}
          variant="outline"
          disabled={state == "jam" || state == "timeout"}
          onClick={periodControlOnClick}
          rightSection={
            state == "stopped" ? (
              <IconRollerSkating size={16} />
            ) : (
              <IconPlayerStop size={16} />
            )
          }
        >
          {state == "stopped" ? "Begin Period" : "End Period"}
        </Button>
      </Stack>
    </Fieldset>
  );
}
