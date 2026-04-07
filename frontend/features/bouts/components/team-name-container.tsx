import { useSuspenseBout } from "@/hooks/use-suspense-bout";
import { Team } from "@/types/bout";
import { TeamUri } from "@/types/query";
import { TextProps } from "@mantine/core";
import { useSetTeamName } from "../hooks/use-set-team-name";
import TeamName from "./team-name";

/**
 * A Team Name container used for displaying and editing the desired Team's name.
 */
export default function TeamNameContainer({
  boutUuid,
  teamNum,
  ...props
}: TeamUri & TextProps) {
  const { data: bout } = useSuspenseBout({ boutUuid });
  const team: Team = bout.teams[teamNum];

  const setTeamName = useSetTeamName({ boutUuid, teamNum });

  return <TeamName teamName={team.name} setTeamName={setTeamName} {...props} />;
}
