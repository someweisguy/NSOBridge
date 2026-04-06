import { useSuspenseBout } from "@/hooks/use-suspense-bout";
import { Team } from "@/types/bout";
import { TeamUri } from "@/types/query";
import { TextProps } from "@mantine/core";
import TeamName from "./team-name";

export default function TeamNameContainer({
  boutUuid,
  teamNum,
  ...props
}: TeamUri & TextProps) {
  const { data: bout } = useSuspenseBout({ boutUuid });
  const team: Team = bout.teams[teamNum];

  return <TeamName teamName={team.name} {...props} />;
}
