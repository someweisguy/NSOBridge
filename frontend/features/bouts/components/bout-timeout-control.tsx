import { Bout } from "@/lib/game/bouts";
import { Button, ButtonProps } from "@mantine/core";
import { useStartTimeout } from "../hooks/use-start-timeout";
import { useStopTimeout } from "../hooks/use-stop-timeout";

interface BoutTimeoutControlProps extends Omit<ButtonProps, "onClick"> {
  bout: Bout;
}

export default function BoutTimeoutControl({
  bout,
  ...props
}: BoutTimeoutControlProps) {
  const startTimeout = useStartTimeout(bout);
  const stopTimeout = useStopTimeout(bout);

  const content = bout.state == "timeout" ? "End Timeout" : "Call Timeout";
  const command = bout.state == "timeout" ? stopTimeout : startTimeout;
  const disabled = bout.state != "lineup" && bout.state != "timeout";

  return (
    <Button disabled={disabled} onClick={() => command.mutate()} {...props}>
      {content}
    </Button>
  );
}
