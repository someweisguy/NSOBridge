import ClockView from "@/components/clock-view";
import { BoutStateString } from "@/types/bout";
import { TextProps } from "@mantine/core";

const stateTexts: Record<BoutStateString, string> = {
  final: "Final",
  jam: "Jam",
  lineup: "Lineup",
  timeout: "Timeout",
  stopped: "Stopped",
};

interface EventClockProps extends TextProps {
  state: BoutStateString;
  startTimestamp: string | null;
}

export default function EventClock({
  state,
  startTimestamp,
  ...props
}: EventClockProps) {
  return (
    <ClockView
      prefix={stateTexts[state]}
      startTimestamp={startTimestamp}
      {...props}
    />
  );
}
