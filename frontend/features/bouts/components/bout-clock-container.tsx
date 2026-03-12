import { useSuspenseBout } from "@/hooks/use-suspense-bout";
import { BoutUri } from "@/types/query";
import { TextProps } from "@mantine/core";
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

  return (
    <BoutClock isOvertime={bout.isOvertime()} {...bout.clock} {...props} />
  );
}
