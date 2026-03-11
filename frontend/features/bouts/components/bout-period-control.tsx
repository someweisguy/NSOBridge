import { BoutStateString } from "@/lib/game/bouts";
import { Button, ButtonProps } from "@mantine/core";
import { useBeginPeriod } from "../hooks/use-begin-period";
import { useEndPeriod } from "../hooks/use-end-period";

interface BoutPeriodControlProps extends Omit<ButtonProps, "onClick"> {
  /**
   * The UUID of the desired Bout.
   */
  boutUuid: string;
  /**
   * The current state of the Bout.
   */
  state: BoutStateString;
}

/**
 * Control the Period state of the desired Bout. This button starts and stops the Period
 * of the desired Bout. This control is not required for scoreboard operation but it
 * does affect the Bout state. The updated Bout state is reflected on scoreboard pages.
 */
export default function BoutPeriodControl({
  boutUuid,
  state,
  ...props
}: BoutPeriodControlProps) {
  const beginPeriod = useBeginPeriod({ boutUuid });
  const endPeriod = useEndPeriod({ boutUuid });

  const content = state == "stopped" ? "Start Period" : "Stop Period";
  const disabled = state == "jam" || state == "timeout";
  const command = state == "stopped" ? beginPeriod : endPeriod;

  return (
    <Button disabled={disabled} onClick={() => command.mutate()} {...props}>
      {content}
    </Button>
  );
}
