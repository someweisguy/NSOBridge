import Clock from "@/components/clock";
import { Jam } from "@/lib/game/jams";
import { jamTimeStringFormatter } from "@/utils/time-string-formatters";
import { Text, TextProps } from "@mantine/core";

interface JamClockProps extends TextProps {
  jam: Jam;
  jamDuration: number;
}

export default function JamClock({
  jam,
  jamDuration,
  ...props
}: JamClockProps) {
  const showClock = !jam.hasStarted() || jam.isRunning();

  // Render the stop reason when the Jam has ended
  let stopReasonText = "-";
  if (!showClock) {
    switch (jam.stopReason) {
      case "called":
        stopReasonText = "Called";
        break;
      case "elapsed":
        stopReasonText = "Time";
        break;
      case "injury":
        stopReasonText = "Injury";
        break;
    }
  }

  return (
    <Text {...props}>
      {showClock ? (
        <Clock
          {...jam}
          alarm={jamDuration}
          formatter={jamTimeStringFormatter}
        />
      ) : (
        stopReasonText
      )}
    </Text>
  );
}
