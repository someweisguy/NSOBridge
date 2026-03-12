import { useSuspenseBout } from "@/hooks/use-suspense-bout";
import { BoutUri } from "@/types/query";
import { TextProps } from "@mantine/core";
import BoutClock from "./bout-clock";

export default function BoutClockContainer({
  boutUuid,
  ...props
}: BoutUri & TextProps) {
  const { data: bout } = useSuspenseBout({ boutUuid });

  return (
    <BoutClock isOvertime={bout.isOvertime()} {...bout.clock} {...props} />
  );
}
