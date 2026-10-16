import { Button, ButtonProps, MantineSize, px } from "@mantine/core";
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";
import { useCallback } from "react";
import { useStartJam } from "../hooks/use-start-jam";
import { useStopJam } from "../hooks/use-stop-jam";

export interface JamStartStopButtonProps extends Omit<ButtonProps, "children"> {
  boutUuid: string;
  jamIsRunning: boolean;
  iconSize: MantineSize | (string & {}) | number;
}

export default function JamStartStopButton({
  boutUuid,
  jamIsRunning,
  iconSize,
  ...props
}: JamStartStopButtonProps) {
  // Handle start/stop Jam
  const { mutate: startJam } = useStartJam({ uuid: boutUuid });
  const { mutate: stopJam } = useStopJam({ uuid: boutUuid });
  const startStopJam = useCallback(
    () => (jamIsRunning ? stopJam() : startJam()),
    [jamIsRunning, startJam, stopJam],
  );
  const startStopJamText = jamIsRunning ? "Stop Jam" : "Start Jam";

  return (
    <Button
      variant="outline"
      color="teal"
      onClick={() => startStopJam()}
      rightSection={
        jamIsRunning ? (
          <IconPlayerPause size={px(iconSize)} />
        ) : (
          <IconPlayerPlay size={px(iconSize)} />
        )
      }
      {...props}
    >
      {startStopJamText}
    </Button>
  );
}
