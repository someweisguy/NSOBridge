import { Bout } from "@/lib/game/bouts";
import { BoutContext } from "@/utils/contexts";
import { Button, ButtonProps } from "@mantine/core";
import { useContext } from "react";
import { useStartTimeout } from "../hooks/use-start-timeout";
import { useStopTimeout } from "../hooks/use-stop-timeout";

export default function BoutTimeoutControl({
  ...props
}: Omit<ButtonProps, "onClick">) {
  const bout: Bout | null = useContext(BoutContext);
  if (bout == null) {
    throw new Error("TimeoutControl must be used within a BoutProvider");
  }

  const startTimeout = useStartTimeout(bout);
  const stopTimeout = useStopTimeout(bout);

  const content = bout.state == "timeout" ? "End Timeout" : "Call Timeout";
  const command = bout.state == "timeout" ? stopTimeout : startTimeout;
  const disabled = bout.state != "lineup" && bout.state != "timeout";

  return (
    <Button disabled={disabled} onClick={() => command.mutate()} {...props}>
      {content}
    </Button>
  );
}
