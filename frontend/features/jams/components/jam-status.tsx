import { StopReasonString } from "@/lib/game/jams";
import { Text, TextProps } from "@mantine/core";
import Clock, { ClockProps } from "../../../components/clock";

interface JamStatusProps extends ClockProps, TextProps {
  isStopped: boolean;
  stopReason: StopReasonString | null;
  stopReasonText?: Record<StopReasonString, string>;
}

export function JamStatus({
  isStopped,
  stopReason,
  stopReasonText = {
    called: "Called",
    elapsed: "Time",
    injury: "Injury",
    other: "-",
  },
  ...props
}: JamStatusProps) {
  if (isStopped) {
    stopReason ??= "other";
    return <Text {...props}>{stopReasonText[stopReason]}</Text>;
  }

  return <Clock {...props} />;
}
