import { Text, TextProps } from "@mantine/core";
import { twMerge } from "tailwind-merge";

interface TeamJamScoreProps extends TextProps {
  jamScore: number;
  disableMonospace?: boolean;
}

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
