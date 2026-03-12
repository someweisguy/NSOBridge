import { useSuspenseBout } from "@/hooks/use-suspense-bout";
import { BoutUri } from "@/types/query";
import { Button, ButtonProps } from "@mantine/core";
import { useStartJam } from "../hooks/use-start-jam";
import { useStopJam } from "../hooks/use-stop-jam";

/**
 * Control the Jam state of the desired Bout. This button starts and stops the latest
 * Jam of the Bout.
 */
export default function BoutJamControlContainer({
  boutUuid,
  ...props
}: BoutUri & Omit<ButtonProps, "onClick">) {
  const { data: bout } = useSuspenseBout({ boutUuid });
  const startJam = useStartJam({ boutUuid });
  const stopJam = useStopJam({ boutUuid });

  const content = bout.state == "jam" ? "Stop Jam" : "Start Jam";
  const command = bout.state == "jam" ? stopJam : startJam;

  return (
    <Button onClick={() => command.mutate()} {...props}>
      {content}
    </Button>
  );
}
