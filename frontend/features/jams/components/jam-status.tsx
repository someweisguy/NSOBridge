import Clock, { ClockProps } from "@/components/clock";
import { Text, TextProps } from "@mantine/core";

interface JamStatusProps extends ClockProps, TextProps {
  /**
   * True if the desired Jam is stopped.
   */
  isStopped: boolean;
  /**
   * Text which displays the reason that the Jam was stopped.
   */
  stopReasonText?: string;
}

/**
 * Display the status of the desired Jam. When the Jam is running the Jam clock is
 * displayed. When the Jam has stopped, the reason that the Jam was stopped is
 * displayed.
 */
export function JamStatus({
  isStopped,
  stopReasonText = "-",
  ...props
}: JamStatusProps) {
  if (isStopped) {
    return <Text {...props}>{stopReasonText}</Text>;
  }

  return <Clock {...props} />;
}
