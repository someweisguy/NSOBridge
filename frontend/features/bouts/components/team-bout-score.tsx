import { Text, TextProps } from "@mantine/core";
import { twMerge } from "tailwind-merge";

interface TeamBoutScoreProps extends TextProps {
  boutScore: number;
  scoreOffset: number;
  disableMonospace?: boolean;
}

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
