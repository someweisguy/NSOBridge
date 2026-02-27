import { StopReasonString } from "@/lib/game/jams";
import { Text, TextProps } from "@mantine/core";
import Clock, { ClockProps } from "../../../components/clock";

interface PlainJamStatusProps extends ClockProps, TextProps {
  stopReason: StopReasonString | null;
  stopReasonText?: Record<StopReasonString, string>;
}

export function JamStatus({
  stopReason,
  stopReasonText = {
    called: "Called",
    elapsed: "Time",
    injury: "Injury",
    other: "-",
  },
  ...props
}: PlainJamStatusProps) {
  if (stopReason != null) {
    return <Text {...props}>{stopReasonText[stopReason]}</Text>;
  }

  return <Clock {...props} />;
}
