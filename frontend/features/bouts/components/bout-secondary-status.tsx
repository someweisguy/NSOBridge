import Clock from "@/components/clock";
import { Text, TextProps } from "@mantine/core";

interface BoutSecondaryStatusProps extends TextProps {
  /**
   * The state text to display.
   */
  stateText: string;
  /**
   * The optional timestamp that marks the beginning of the current Bout state.
   */
  since?: Date | null;
}

/**
 * Display the secondary status of a Bout. This is typically used to display non-Jam
 * states.
 */
export function BoutSecondaryStatus({
  since = null,
  stateText,
  ...props
}: BoutSecondaryStatusProps) {
  const showClock = since != null;
  const showSpace = stateText?.length > 0 && showClock;

  return (
    <Text {...props}>
      {stateText}
      {showSpace && " "}
      {showClock && <Clock startTimestamp={since} />}
    </Text>
  );
}
