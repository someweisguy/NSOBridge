import ClockView from "@/components/clock-view";
import { TextProps } from "@mantine/core";

interface EventClockProps extends TextProps {
  prefix: string;
  startTimestamp: string | null;
}

export default function EventClock({
  prefix,
  startTimestamp,
  ...props
}: EventClockProps) {
  return (
    <ClockView prefix={prefix} startTimestamp={startTimestamp} {...props} />
  );
}
