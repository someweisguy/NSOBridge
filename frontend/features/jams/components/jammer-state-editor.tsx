import {
  Checkbox,
  createTheme,
  Divider,
  Group,
  GroupProps,
  MantineProvider,
} from "@mantine/core";
import { IconStarFilled } from "@tabler/icons-react";
import { useTeamJamAddLead } from "../hooks/use-team-jam-add-lead";
import { useTeamJamAddLost } from "../hooks/use-team-jam-add-lost";
import { useTeamJamAddStarPass } from "../hooks/use-team-jam-add-star-pass";
import { TeamJam } from "@/types/jam";

const checkBoxTheme = createTheme({
  // Hovering over checkbox should change cursor
  cursorType: "pointer",
});

interface JammerStateProps extends GroupProps {
  /**
   * True if this team's Jammer is the lead Jammer.
   */
  lead: boolean;
  /**
   * True if this team's Jammer has explicitly lost lead Jammer eligibility.
   */
  lost: boolean;
  /**
   * True if this team's Jammer has successfully completed a Star Pass.
   */
  starPass: boolean;
  /**
   * True if this team's Jammer is still eligible for lead. This value would be false if
   * the other team's Jammer has been declared lead.
   */
  isLeadEligible: boolean;

  boutUuid: string;
  periodNum: number;
  jamNum: number;
  teamNum: number;
  teamJam: TeamJam;
}

/**
 * Displays and allows for editing of the Jammer's state. This shows whether the Jammer
 * has been declared lead, has lost eligibility for lead, or if a star pass has
 * occurred.
 */
export default function JammerStateEditor({
  isLeadEligible,
  boutUuid,
  periodNum,
  jamNum,
  teamNum,
  teamJam,
  ...props
}: JammerStateProps) {
  const setLead = useTeamJamAddLead({
    boutUuid,
    periodNum,
    jamNum,
    teamNum,
  });
  const setLost = useTeamJamAddLost({
    boutUuid,
    periodNum,
    jamNum,
    teamNum,
  });
  const setStarPass = useTeamJamAddStarPass({
    boutUuid,
    periodNum,
    jamNum,
    teamNum,
  });

  const lead = teamJam.events.some((tripEvent) => tripEvent.lead);
  const lost = teamJam.events.some((tripEvent) => tripEvent.lost);
  const starPass = teamJam.events.some((tripEvent) => tripEvent.starPass);

  return (
    <MantineProvider theme={checkBoxTheme}>
      <Group {...props}>
        <Checkbox
          label="Lead"
          checked={lead}
          disabled={!isLeadEligible}
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
      </Group>
    </MantineProvider>
  );
}
