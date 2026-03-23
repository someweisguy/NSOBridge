import { useSuspenseBout } from "@/hooks/use-suspense-bout";
import { BoutUri } from "@/types/query";
import { TextProps } from "@mantine/core";
import { useSetBoutClockElapsed } from "../hooks/use-set-bout-clock-elapsed";
import { useSetBoutClockIsRunning } from "../hooks/use-set-bout-clock-is-running";
import BoutClock from "./bout-clock";

/**
 * Display the Period clock for the desired Bout. When the Bout is in overtime, overtime
 * text is displayed instead of a clock.
 */
export default function BoutClockContainer({
  boutUuid,
  ...props
}: BoutUri & TextProps) {
  const { data: bout } = useSuspenseBout({ boutUuid });

  const setElapsed = useSetBoutClockElapsed({ boutUuid });
  const setIsRunning = useSetBoutClockIsRunning({ boutUuid });

  return (
    <BoutClock
      isOvertime={bout.isOvertime()}
      setElapsed={setElapsed}
      setIsRunning={setIsRunning}
      {...bout.clock}
      {...props}
      editable
    />
  );
}
