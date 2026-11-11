import { Button, ButtonProps, MantineSize, px } from "@mantine/core";
import { IconPlayerStop, IconRollerSkating } from "@tabler/icons-react";
import { useCallback } from "react";
import { useBeginPeriod } from "../hooks/use-begin-period";
import { useEndPeriod } from "../hooks/use-end-period";

export interface PeriodStartStopButtonProps extends Omit<
  ButtonProps,
  "children"
> {
  boutUuid: string;
  periodIsRunning: boolean;
  iconSize: MantineSize | (string & {}) | number;
}

// TODO: docs
export default function PeriodStartStopButton({
  boutUuid,
  periodIsRunning,
  disabled,
  iconSize,
  ...props
}: PeriodStartStopButtonProps) {
  // Handle start/stop Period
  const { mutate: startPeriod } = useBeginPeriod({ uuid: boutUuid });
  const { mutate: stopPeriod } = useEndPeriod({ uuid: boutUuid });
  const startStopPeriod = useCallback(
    () => (periodIsRunning ? stopPeriod() : startPeriod()),
    [periodIsRunning, startPeriod, stopPeriod],
  );
  const startStopPeriodText = periodIsRunning ? "End Period" : "Begin Period";

  return (
    <Button
      onClick={() => startStopPeriod()}
      disabled={disabled}
      rightSection={
        periodIsRunning ? (
          <IconPlayerStop size={px(iconSize)} />
        ) : (
          <IconRollerSkating size={px(iconSize)} />
        )
      }
      {...props}
    >
      {startStopPeriodText}
    </Button>
  );
}
