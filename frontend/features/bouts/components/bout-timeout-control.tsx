import { BoutStateString } from "@/lib/game/bouts";
import { Button, ButtonProps } from "@mantine/core";
import { useStartTimeout } from "../hooks/use-start-timeout";
import { useStopTimeout } from "../hooks/use-stop-timeout";

interface BoutTimeoutControlProps extends Omit<ButtonProps, "onClick"> {
  /**
   * The UUID of the desired Bout.
   */
  uuid: string;
  /**
   * The current state of the Bout.
   */
  state: BoutStateString;
}

/**
 * Control the Timeout state of the desired Bout. This button starts and stops the
 * latest Timeout of the Bout.
 */
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
