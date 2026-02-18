import { Bout } from "@/lib/game/bouts";
import { BoutContext } from "@/utils/contexts";
import { Button, ButtonProps } from "@mantine/core";
import { useContext } from "react";
import { useBeginPeriod } from "../hooks/begin-period";
import { useEndPeriod } from "../hooks/end-period";

export default function BoutPeriodControl({
  ...props
}: Omit<ButtonProps, "onClick">) {
  const bout: Bout | null = useContext(BoutContext);
  if (bout == null) {
    throw new Error("PeriodControl must be used within a BoutProvider");
  }

  const beginPeriod = useBeginPeriod(bout);
  const endPeriod = useEndPeriod(bout);

  const content = bout.state == "stopped" ? "Start Period" : "Stop Period";
  const disabled = bout.state == "jam" || bout.state == "timeout";
  const command = bout.state == "stopped" ? beginPeriod : endPeriod;

  return (
    <Button disabled={disabled} onClick={() => command.mutate()} {...props}>
      {content}
    </Button>
  );
}
