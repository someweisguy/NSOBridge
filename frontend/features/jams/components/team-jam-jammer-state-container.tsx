import { useSuspenseJam } from "@/hooks/use-suspense-jam";
import { Bout } from "@/lib/game/bouts";
import { TeamJam } from "@/lib/game/jams";
import {
  Checkbox,
  createTheme,
  Divider,
  Group,
  MantineProvider,
} from "@mantine/core";
import { IconStarFilled } from "@tabler/icons-react";
import { useTeamJamAddLead } from "../hooks/use-team-jam-add-lead";
import { useTeamJamAddLost } from "../hooks/use-team-jam-add-lost";
import { useTeamJamAddStarPass } from "../hooks/use-team-jam-add-star-pass";

const checkBoxTheme = createTheme({
  cursorType: "pointer",
});

interface TeamJamJammerStateEditorContainerProps {
  bout: Bout;
  periodNum: number;
  jamNum: number;
  teamJamNum: number;
}

export default function TeamJamJammerStateEditorContainer({
  bout,
  periodNum,
  jamNum,
  teamJamNum,
}: TeamJamJammerStateEditorContainerProps) {
  const { data: jam } = useSuspenseJam(bout, periodNum, jamNum);
  const teamJam: TeamJam = jam.teamJams[teamJamNum];

  const setLead = useTeamJamAddLead(jam, teamJam);
  const setLost = useTeamJamAddLost(jam, teamJam);
  const setStarPass = useTeamJamAddStarPass(jam, teamJam);

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
