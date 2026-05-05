import { BoutStateString } from "@/types/bout";
import { Button, ButtonProps } from "@mantine/core";
import { useCallback } from "react";
import { useStartTimeout } from "../hooks/use-start-timeout";
import { useStopTimeout } from "../hooks/use-stop-timeout";

interface BoutTimeoutControlProps extends ButtonProps {
  uuid: string;
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
  const startTimeout = useStartTimeout({ boutUuid: uuid });
  const stopTimeout = useStopTimeout({ boutUuid: uuid });
  const onClick = useCallback(
    () => (state == "timeout" ? stopTimeout.mutate() : startTimeout.mutate()),
    [state, stopTimeout, startTimeout],
  );

  const content = state == "timeout" ? "End Timeout" : "Call Timeout";
  const disabled = state != "lineup" && state != "timeout";

  return (
    <Button disabled={disabled} onClick={onClick} {...props}>
      {content}
    </Button>
  );
}
