import ClockView from "@/components/clock-view";
import { Text, TextProps } from "@mantine/core";

interface EventClockProps extends TextProps {
  prefix: string;
  hideClock?: boolean;
  startTimestamp: string | null;
}

export default function EventClock({
  prefix,
  hideClock = false,
  startTimestamp,
  ...props
}: EventClockProps) {
  if (startTimestamp == null || hideClock) {
    return <Text {...props}>{prefix}</Text>;
  }

  return (
    <ClockView prefix={prefix} startTimestamp={startTimestamp} {...props} />
  );
}
