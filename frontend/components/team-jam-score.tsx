import { Team } from "@/lib/game/bouts";
import { TeamContext } from "@/utils/contexts";
import { Text, TextProps } from "@mantine/core";
import { useContext } from "react";
import { twMerge } from "tailwind-merge";

interface TeamJamScoreProps extends TextProps {
  disableMonospace?: boolean;
}

export default function TeamJamScore({
  disableMonospace,
  ...props
}: TeamJamScoreProps) {
  const team: Team | null = useContext(TeamContext);
  if (team == null) {
    throw new Error("TeamBoutScore must be used within a TeamProvider");
  }

  return (
    <Text className={twMerge(!disableMonospace && "tabular-nums")} {...props}>
      {team.jamScore}
    </Text>
  );
}
