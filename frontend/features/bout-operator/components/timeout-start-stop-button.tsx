import { Button, ButtonProps, MantineSize, px } from "@mantine/core";
import { IconAlarm } from "@tabler/icons-react";
import { useCallback } from "react";
import { useStartTimeout } from "../hooks/use-start-timeout";
import { useStopTimeout } from "../hooks/use-stop-timeout";

export interface TimeoutStartStopButtonProps extends Omit<
  ButtonProps,
  "children"
> {
  boutUuid: string;
  timeoutIsRunning: boolean;
  iconSize: MantineSize | (string & {}) | number;
}

// TODO: docs
export default function TimeoutStartStopButton({
  boutUuid,
  timeoutIsRunning,
  iconSize,
  ...props
}: TimeoutStartStopButtonProps) {
  // Handle start/stop Timeout
  const { mutate: startTimeout } = useStartTimeout({ uuid: boutUuid });
  const { mutate: stopTimeout } = useStopTimeout({ uuid: boutUuid });
  const startStopTimeout = useCallback(
    () => (timeoutIsRunning ? stopTimeout() : startTimeout()),
    [timeoutIsRunning, startTimeout, stopTimeout],
  );
  const startStopTimeoutText = timeoutIsRunning
    ? "End Timeout"
    : "Call Timeout";

  return (
    <Button
      variant="outline"
      color="yellow"
      onClick={() => startStopTimeout()}
      rightSection={<IconAlarm size={px(iconSize)} />}
      {...props}
    >
      {startStopTimeoutText}
    </Button>
  );
}
