import { BoutStateString } from "@/types/bout";
import { Button, ButtonProps } from "@mantine/core";
import { useCallback } from "react";
import { useBeginPeriod } from "../hooks/use-begin-period";
import { useEndPeriod } from "../hooks/use-end-period";

interface BoutPeriodControlProps extends ButtonProps {
  uuid: string;
  state: BoutStateString;
}

/**
 * Control the Period state of the desired Bout. This button starts and stops the Period
 * of the desired Bout. This control is not required for scoreboard operation but it
 * does affect the Bout state. The updated Bout state is reflected on scoreboard pages.
 */
export default function BoutPeriodControl({
  uuid,
  state,
  ...props
}: BoutPeriodControlProps) {
  const beginPeriod = useBeginPeriod({ boutUuid: uuid });
  const endPeriod = useEndPeriod({ boutUuid: uuid });

  const onClick = useCallback(
    () => (state == "stopped" ? beginPeriod.mutate() : endPeriod.mutate()),
    [state, beginPeriod, endPeriod],
  );

  const content = state == "stopped" ? "Start Period" : "Stop Period";
  const disabled = state == "jam" || state == "timeout";

  return (
    <Button disabled={disabled} onClick={onClick} {...props}>
      {content}
    </Button>
  );
}
