import { BoutStateString } from "@/types/bout";
import { Button, ButtonProps } from "@mantine/core";

interface BoutPeriodControlProps extends ButtonProps {
  boutState: BoutStateString;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

/**
 * Control the Period state of the desired Bout. This button starts and stops the Period
 * of the desired Bout. This control is not required for scoreboard operation but it
 * does affect the Bout state. The updated Bout state is reflected on scoreboard pages.
 */
export default function BoutPeriodControl({
  boutState,
  onClick,
  ...props
}: BoutPeriodControlProps) {
  const content = boutState == "stopped" ? "Start Period" : "Stop Period";
  const disabled = boutState == "jam" || boutState == "timeout";

  return (
    <Button disabled={disabled} onClick={onClick} {...props}>
      {content}
    </Button>
  );
}
