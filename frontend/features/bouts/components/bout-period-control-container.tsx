import { useSuspenseBout } from "@/hooks/use-suspense-bout";
import { BoutUri } from "@/types/query";
import { Button, ButtonProps } from "@mantine/core";
import { useBeginPeriod } from "../hooks/use-begin-period";
import { useEndPeriod } from "../hooks/use-end-period";

/**
 * Control the Period state of the desired Bout. This button starts and stops the Period
 * of the desired Bout. This control is not required for scoreboard operation but it
 * does affect the Bout state. The updated Bout state is reflected on scoreboard pages.
 */
export default function BoutPeriodControlContainer({
  boutUuid,
  ...props
}: BoutUri & Omit<ButtonProps, "onClick">) {
  const { data: bout } = useSuspenseBout({ boutUuid });
  const beginPeriod = useBeginPeriod({ boutUuid });
  const endPeriod = useEndPeriod({ boutUuid });

  const content = bout.state == "stopped" ? "Start Period" : "Stop Period";
  const disabled = bout.state == "jam" || bout.state == "timeout";
  const command = bout.state == "stopped" ? beginPeriod : endPeriod;

  return (
    <Button disabled={disabled} onClick={() => command.mutate()} {...props}>
      {content}
    </Button>
  );
}
