import { Bout } from "@/lib/game/bouts";
import { BoutContext } from "@/utils/contexts";
import { Button, ButtonProps } from "@mantine/core";
import { useContext } from "react";
import { useStartJam } from "../hooks/start-jam";
import { useStopJam } from "../hooks/stop-jam";

export default function JamControl({ ...props }: Omit<ButtonProps, "onClick">) {
  const bout: Bout | null = useContext(BoutContext);
  if (bout == null) {
    throw new Error("JamControl must be used within a BoutProvider");
  }

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
