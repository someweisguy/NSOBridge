import { useSuspenseBout } from "@/hooks/use-suspense-bout";
import { BoutUri } from "@/types/query";
import { ButtonProps } from "@mantine/core";
import { useStartJam } from "../hooks/use-start-jam";
import { useStopJam } from "../hooks/use-stop-jam";
import BoutJamControl from "./bout-jam-control";

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

  const command = bout.state == "jam" ? stopJam : startJam;

  return (
    <BoutJamControl
      boutState={bout.state}
      onClick={() => command.mutate()}
      {...props}
    />
  );
}
