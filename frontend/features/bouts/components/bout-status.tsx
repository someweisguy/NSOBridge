import Clock from "@/components/clock";
import { Text, TextProps } from "@mantine/core";

interface BoutStatusProps extends TextProps {
  stateText: string;
  since?: Date | null;
}

export function BoutStatus({
  since = null,
  stateText,
  ...props
}: BoutStatusProps) {
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
