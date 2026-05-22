import { useBeginPeriod } from "@/features/operator/hooks/use-begin-period";
import { useEndPeriod } from "@/features/operator/hooks/use-end-period";
import { useStartJam } from "@/features/operator/hooks/use-start-jam";
import { useStartTimeout } from "@/features/operator/hooks/use-start-timeout";
import { useStopJam } from "@/features/operator/hooks/use-stop-jam";
import { useStopTimeout } from "@/features/operator/hooks/use-stop-timeout";
import { BoutStateString } from "@/types/bout";
import { BoutUri } from "@/types/query";
import { Button, Fieldset, Group } from "@mantine/core";
import { useCallback } from "react";

export default function BoutControl({
  state,
  ...boutUri
}: BoutUri & { state: BoutStateString }) {
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
    <Fieldset legend="Bout Controls" w="fit-content">
      <Group wrap="nowrap">
        <Button size="xs" onClick={jamControlOnClick}>
          {state == "jam" ? "Stop Jam" : "Start Jam"}
        </Button>
        <Button
          size="xs"
          disabled={state != "lineup" && state != "timeout"}
          onClick={timeoutControlOnClick}
        >
          {state == "timeout" ? "End Timeout" : "Call Timeout"}
        </Button>
        <Button
          size="xs"
          disabled={state == "jam" || state == "timeout"}
          onClick={periodControlOnClick}
        >
          {state == "stopped" ? "Start Period" : "Stop Period"}
        </Button>
      </Group>
    </Fieldset>
  );
}
