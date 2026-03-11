import { BoutStateString } from "@/lib/game/bouts";
import { Button, ButtonProps } from "@mantine/core";
import { useStartJam } from "../hooks/use-start-jam";
import { useStopJam } from "../hooks/use-stop-jam";

interface BoutJamControlProps extends Omit<ButtonProps, "onClick"> {
  /**
   * The UUID of the desired Bout.
   */
  boutUuid: string;
  /**
   * The current state of the desired Bout.
   */
  state: BoutStateString;
}

/**
 * Control the Jam state of the desired Bout. This button starts and stops the latest
 * Jam of the Bout.
 */
export default function BoutJamControl({
  boutUuid,
  state,
  ...props
}: BoutJamControlProps) {
  const startJam = useStartJam({ boutUuid });
  const stopJam = useStopJam({ boutUuid });

  const content = state == "jam" ? "Stop Jam" : "Start Jam";
  const command = state == "jam" ? stopJam : startJam;

  return (
    <Button onClick={() => command.mutate()} {...props}>
      {content}
    </Button>
  );
}
