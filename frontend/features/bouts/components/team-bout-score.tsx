import { Text, TextProps } from "@mantine/core";
import { twMerge } from "tailwind-merge";

interface TeamBoutScoreProps extends TextProps {
  /**
   * The Bout score for the Team.
   */
  boutScore: number;
  /**
   * The bout score offset for the team. This value is summed with `boutScore`.
   */
  scoreOffset: number;
  /**
   * True to disable the monospace number character set for this component.
   */
  disableMonospace?: boolean;
}

/**
 * Display the Bout score for a Team.
 */
export default function TeamBoutScore({
  boutScore,
  scoreOffset = 0,
  disableMonospace = false,
  ...props
}: TeamBoutScoreProps) {
  return (
    <Text className={twMerge(!disableMonospace && "tabular-nums")} {...props}>
      {boutScore + scoreOffset}
    </Text>
  );
}
