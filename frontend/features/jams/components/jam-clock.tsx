import Clock, { ClockProps } from "@/components/clock";
import { StopReasonString } from "@/types/jam";
import { Text, TextProps } from "@mantine/core";

// Default strings to display for the various reason a Jam can be stopped.
const stopReasonTexts = {
  called: "Called",
  elapsed: "Time",
  injury: "Injury",
  other: "-",
};

interface JamClockProps extends ClockProps, TextProps {
  stopReason: StopReasonString | null;
  jamDuration: number;
}

/**
 * Display the status of the desired Jam. When the Jam is running the Jam clock is
 * displayed. When the Jam has stopped, the reason that the Jam was stopped is
 * displayed.
 */
export function JamClock({ stopReason, jamDuration, ...props }: JamClockProps) {
  const stopReasonText = stopReason != null ? stopReasonTexts[stopReason] : "-";

  return (
    <Text {...props}>
      {stopReason != null ? (
        stopReasonText
      ) : (
        <Clock alarm={jamDuration} {...props} />
      )}
    </Text>
  );
}
