import { Bout } from "@/lib/game/bouts";
import { Button, ButtonProps } from "@mantine/core";
import { useBeginPeriod } from "../hooks/use-begin-period";
import { useEndPeriod } from "../hooks/use-end-period";

interface BoutPeriodControlProps extends Omit<ButtonProps, "onClick"> {
  bout: Bout;
}

export default function BoutPeriodControl({
  bout,
  ...props
}: BoutPeriodControlProps) {
  const beginPeriod = useBeginPeriod(bout.uuid);
  const endPeriod = useEndPeriod(bout.uuid);

  const content = bout.state == "stopped" ? "Start Period" : "Stop Period";
  const disabled = bout.state == "jam" || bout.state == "timeout";
  const command = bout.state == "stopped" ? beginPeriod : endPeriod;

  return (
    <Button disabled={disabled} onClick={() => command.mutate()} {...props}>
      {content}
    </Button>
  );
}
