import { BoutStateString } from "@/lib/game/bouts";
import { Button, ButtonProps } from "@mantine/core";
import { useBeginPeriod } from "../hooks/use-begin-period";
import { useEndPeriod } from "../hooks/use-end-period";

interface BoutPeriodControlProps extends Omit<ButtonProps, "onClick"> {
  uuid: string;
  state: BoutStateString;
}

export default function BoutPeriodControl({
  uuid,
  state,
  ...props
}: BoutPeriodControlProps) {
  const beginPeriod = useBeginPeriod(uuid);
  const endPeriod = useEndPeriod(uuid);

  const content = state == "stopped" ? "Start Period" : "Stop Period";
  const disabled = state == "jam" || state == "timeout";
  const command = state == "stopped" ? beginPeriod : endPeriod;

  return (
    <Button disabled={disabled} onClick={() => command.mutate()} {...props}>
      {content}
    </Button>
  );
}
