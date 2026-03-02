import Clock, { ClockProps } from "@/components/clock";
import { Text, TextProps } from "@mantine/core";

interface BoutClockProps extends ClockProps, TextProps {
  /**
   * True if the Bout is in overtime.
   */
  isOvertime?: boolean;
  /**
   * The text to display instead of the Clock when the Bout is in overtime.
   */
  overtimeText?: string;
}

/**
 * Displays the current status of the desired Bout. Shows the Period Clock when the game
 * is running normally. When the Bout goes into overtime, an overtime label is
 * displayed.
 */
export default function BoutClock({
  isOvertime = false,
  overtimeText = "OT",
  ...props
}: BoutClockProps) {
  return (
    <Text {...props}>
      {isOvertime ? overtimeText : <Clock {...props} formatter="bout" />}
    </Text>
  );
}
