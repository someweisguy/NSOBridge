import Clock, { ClockProps } from "@/components/clock";
import { periodTimeStringFormatter } from "@/utils/time-string-formatters";
import { Text, TextProps } from "@mantine/core";

interface BoutClockProps extends ClockProps, TextProps {
  isOvertime?: boolean;
  overtimeText?: string;
}

export default function BoutClock({
  isOvertime = false,
  overtimeText = "OT",
  ...props
}: BoutClockProps) {
  return (
    <Text {...props}>
      {isOvertime ? (
        overtimeText
      ) : (
        <Clock {...props} formatter={periodTimeStringFormatter} />
      )}
    </Text>
  );
}
