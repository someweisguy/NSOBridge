import { Team } from "@/lib/game/bouts";
import { TeamContext } from "@/utils/contexts";
import { Text, TextProps } from "@mantine/core";
import { useContext } from "react";

export default function TeamJamScore({ ...props }: TextProps) {
  const team: Team | null = useContext(TeamContext);
  if (team == null) {
    throw new Error("TeamBoutScore must be used within a TeamProvider");
  }

  return <Text {...props}>{team.jamScore}</Text>;
}
