import { useSetLead, useSetLost, useSetStarPass } from "@/hooks/use-jam";
import { Team } from "@/lib/game/bouts";
import { Jam, TeamJam } from "@/lib/game/jams";
import {
  Checkbox,
  createTheme,
  Divider,
  Group,
  MantineProvider,
} from "@mantine/core";
import { IconStarFilled } from "@tabler/icons-react";

interface JammerStatusButtonsProps {
  jam: Jam;
  team: Team;
}

const checkBoxTheme = createTheme({
  cursorType: "pointer",
});

export default function TeamJamJammerState({
  jam,
  team,
}: JammerStatusButtonsProps) {
  const teamJam: TeamJam | undefined = jam.teamJams.find(
    (teamJam: TeamJam) => teamJam.teamNum === team.num,
  );
  if (teamJam == undefined) {
    throw new Error("team jam not found");
  }
  const setLead = useSetLead(jam, teamJam);
  const setLost = useSetLost(jam, teamJam);
  const setStarPass = useSetStarPass(jam, teamJam);

  const lead = teamJam.events.some((tripEvent) => tripEvent.lead);
  const lost = teamJam.events.some((tripEvent) => tripEvent.lost);
  const starPass = teamJam.events.some((tripEvent) => tripEvent.starPass);

  // The Lead checkbox should be disabled if another team has lead
  let isLeadEligible = true;
  if (!lost) {
    for (const tj of jam.teamJams) {
      if (tj == teamJam) {
        continue;
      }
      for (const event of tj.events) {
        if (event.lead) {
          isLeadEligible = false;
          break;
        }
      }
      if (!isLeadEligible) {
        break;
      }
    }
  }

  return (
    <Group justify="center" gap="md">
      <MantineProvider theme={checkBoxTheme}>
        <Checkbox
          label="Lead"
          checked={lead}
          disabled={lost || !isLeadEligible}
          onClick={() => setLead.mutate(!lead)}
          variant="outline"
          icon={({ ...others }) => <IconStarFilled {...others} />}
        />
        <Divider orientation="vertical" />
        <Checkbox
          label="Lost"
          checked={lost}
          onClick={() => setLost.mutate(!lost)}
          variant="outline"
        />
        <Divider orientation="vertical" />
        <Checkbox
          label="Star Pass"
          checked={starPass}
          onClick={() => setStarPass.mutate(!starPass)}
          variant="outline"
        />
      </MantineProvider>
    </Group>
  );
}
