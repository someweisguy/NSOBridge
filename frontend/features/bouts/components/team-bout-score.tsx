import { Text, TextProps } from "@mantine/core";

interface TeamBoutScoreProps extends TextProps {
  /**
   * The Bout score for the Team.
   */
  boutScore: number;
  /**
   * The bout score offset for the team. This value is summed with `boutScore`.
   */
  scoreOffset: number;
}

/**
 * Display the Bout score for a Team.
 */
export default function TeamBoutScore({
  boutScore,
  scoreOffset = 0,
  ...props
}: TeamBoutScoreProps) {
  return <Text {...props}>{boutScore + scoreOffset}</Text>;
}
