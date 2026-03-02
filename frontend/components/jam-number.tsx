import { Text, TextProps } from "@mantine/core";

interface JamNumberProps extends TextProps {
  /**
   * The Period number to display where 0 is the initial Period.
   */
  periodNum: number;
  /**
   * The Jam number to display where 0 is the initial Jam.
   */
  jamNum: number;
}

/**
 * Display a Jam's Period and Jam number in a standardized format.
 */
export default function JamNumber({
  periodNum,
  jamNum,
  ...props
}: JamNumberProps) {
  return (
    <Text {...props}>
      P{periodNum + 1} J{jamNum + 1}
    </Text>
  );
}
