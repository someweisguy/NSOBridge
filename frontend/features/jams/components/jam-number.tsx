import { Text, TextProps } from "@mantine/core";

interface JamNumberProps extends TextProps {
  periodNum: number;
  jamNum: number;
}

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
