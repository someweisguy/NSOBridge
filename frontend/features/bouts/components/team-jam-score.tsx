import { Text, TextProps } from "@mantine/core";

interface TeamJamScoreProps extends TextProps {
  /**
   * The Jam score for the Team.
   */
  jamScore: number;
}

/**
 * Display the Jam score for a Team.
 */
export default function TeamJamScore({
  jamScore,
  ...props
}: TeamJamScoreProps) {
  return <Text {...props}>{jamScore}</Text>;
}
