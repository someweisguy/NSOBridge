import { BoutStateString } from "@/types/bout";
import { Button, ButtonProps } from "@mantine/core";
import { useCallback } from "react";
import { useStartJam } from "../hooks/use-start-jam";
import { useStopJam } from "../hooks/use-stop-jam";

interface BoutJamControlProps extends ButtonProps {
  uuid: string;
  state: BoutStateString;
}

/**
 * Control the Jam state of the desired Bout. This button is used to start and stop the
 * latest Jam of the Bout.
 */
export default function BoutJamControl({
  uuid,
  state,
  ...props
}: BoutJamControlProps) {
  const startJam = useStartJam({ boutUuid: uuid });
  const stopJam = useStopJam({ boutUuid: uuid });

  const onClick = useCallback(
    () => (state == "jam" ? stopJam.mutate() : startJam.mutate()),
    [state, startJam, stopJam],
  );

  return (
    <Button onClick={onClick} {...props}>
      {state == "jam" ? "Stop Jam" : "Start Jam"}
    </Button>
  );
}
