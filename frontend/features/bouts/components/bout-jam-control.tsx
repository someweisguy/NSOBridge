import { Bout } from "@/lib/game/bouts";
import { Button, ButtonProps } from "@mantine/core";
import { useStartJam } from "../hooks/use-start-jam";
import { useStopJam } from "../hooks/use-stop-jam";

interface BoutJamControlProps extends Omit<ButtonProps, "onClick"> {
  bout: Bout;
}

export default function BoutJamControl({
  bout,
  ...props
}: BoutJamControlProps) {
  const startJam = useStartJam(bout);
  const stopJam = useStopJam(bout);

  const content = bout.state == "jam" ? "Stop Jam" : "Start Jam";
  const command = bout.state == "jam" ? stopJam : startJam;

  return (
    <Button onClick={() => command.mutate()} {...props}>
      {content}
    </Button>
  );
}
