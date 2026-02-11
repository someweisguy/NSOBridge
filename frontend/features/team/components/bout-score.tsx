import { Team } from "@/lib/game/bouts";
import { TeamContext } from "@/utils/contexts";
import { Text, TextProps } from "@mantine/core";
import { useContext } from "react";

interface TeamBoutScoreProps extends TextProps {
  hideOffset: number;
}

export default function TeamBoutScore({
  hideOffset,
  ...props
}: TeamBoutScoreProps) {
  const team: Team | null = useContext(TeamContext);
  if (team == null) {
    throw new Error("TeamBoutScore must be used within a TeamProvider");
  }

  return (
    <Text {...props}>
      {team.boutScore + (!hideOffset ? team.scoreOffset : 0)}
    </Text>
  );
}
