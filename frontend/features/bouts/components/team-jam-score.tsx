import { Text, TextProps } from "@mantine/core";
import { twMerge } from "tailwind-merge";

interface TeamJamScoreProps extends TextProps {
  /**
   * The Jam score for the Team.
   */
  jamScore: number;
  /**
   * True to disable the monospace number character set for this component.
   */
  disableMonospace?: boolean;
}

/**
 * Display the Jam score for a Team.
 */
export default function TeamJamScore({
  jamScore,
  disableMonospace,
  ...props
}: TeamJamScoreProps) {
  return (
    <Text className={twMerge(!disableMonospace && "tabular-nums")} {...props}>
      {jamScore}
    </Text>
  );
}
