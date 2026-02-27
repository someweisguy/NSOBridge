import { BoutStateString } from "@/lib/game/bouts";
import { Button, ButtonProps } from "@mantine/core";
import { useStartJam } from "../hooks/use-start-jam";
import { useStopJam } from "../hooks/use-stop-jam";

interface BoutJamControlProps extends Omit<ButtonProps, "onClick"> {
  uuid: string;
  state: BoutStateString;
}

export default function BoutJamControl({
  uuid,
  state,
  ...props
}: BoutJamControlProps) {
  const startJam = useStartJam(uuid);
  const stopJam = useStopJam(uuid);

  const content = state == "jam" ? "Stop Jam" : "Start Jam";
  const command = state == "jam" ? stopJam : startJam;

  return (
    <Button onClick={() => command.mutate()} {...props}>
      {content}
    </Button>
  );
}
