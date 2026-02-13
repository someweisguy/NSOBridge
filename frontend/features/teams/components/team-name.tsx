import { Team } from "@/lib/game/bouts";
import { TeamContext } from "@/utils/contexts";
import { Text, TextProps } from "@mantine/core";
import { useContext } from "react";

interface TeamNameProps extends TextProps {
  asMnemonic?: boolean;
}

export default function TeamName({
  asMnemonic = false,
  ...props
}: TeamNameProps) {
  const team: Team | null = useContext(TeamContext);
  if (team == null) {
    throw new Error("TeamName must be used within a TeamProvider");
  }

  return <Text {...props}>{asMnemonic ? team.mnemonic : team.name}</Text>;
}
