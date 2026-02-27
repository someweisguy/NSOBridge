import Clock, { ClockProps } from "@/components/clock";
import { periodTimeStringFormatter } from "@/utils/time-string-formatters";
import { Text, TextProps } from "@mantine/core";

interface BoutStatusProps extends ClockProps, TextProps {
  isOvertime?: boolean;
  overtimeText?: string;
}

export default function BoutStatus({
  isOvertime = false,
  overtimeText = "OT",
  ...props
}: BoutStatusProps) {
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
