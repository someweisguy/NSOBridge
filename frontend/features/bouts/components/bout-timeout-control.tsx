import { BoutStateString } from "@/lib/game/bouts";
import { Button, ButtonProps } from "@mantine/core";
import { useStartTimeout } from "../hooks/use-start-timeout";
import { useStopTimeout } from "../hooks/use-stop-timeout";

interface BoutTimeoutControlProps extends Omit<ButtonProps, "onClick"> {
  uuid: string;
  state: BoutStateString;
}

export default function BoutTimeoutControl({
  uuid,
  state,
  ...props
}: BoutTimeoutControlProps) {
  const startTimeout = useStartTimeout(uuid);
  const stopTimeout = useStopTimeout(uuid);

  const content = state == "timeout" ? "End Timeout" : "Call Timeout";
  const command = state == "timeout" ? stopTimeout : startTimeout;
  const disabled = state != "lineup" && state != "timeout";

  return (
    <Button disabled={disabled} onClick={() => command.mutate()} {...props}>
      {content}
    </Button>
  );
}
