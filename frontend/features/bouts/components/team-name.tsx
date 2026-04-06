import { Text, TextProps } from "@mantine/core";

interface TeamNameProps extends TextProps {
  teamName: string;
  editable?: boolean;
}

export default function TeamName({
  teamName,
  // editable = false,
  ...props
}: TeamNameProps) {
  return <Text {...props}>{teamName}</Text>;
}
