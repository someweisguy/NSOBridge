import Clock from "@/components/clock";
import { Text, TextProps } from "@mantine/core";

interface StatusClockProps extends TextProps {
  /**
   * The state text to display.
   */
  stateText: string;
  /**
   * The optional timestamp that marks the beginning of the current Bout state.
   */
  startTimestamp?: Date | null;
}

/**
 * Display the secondary status of a Bout. This is typically used to display non-Jam
 * states.
 */
export function StatusClock({
  startTimestamp = null,
  stateText,
  ...props
}: StatusClockProps) {
  const showClock = startTimestamp != null;
  const showSpace = stateText?.length > 0 && showClock;

  return (
    <Text {...props}>
      {stateText}
      {showSpace && " "}
      {showClock && <Clock startTimestamp={startTimestamp} />}
    </Text>
  );
}
