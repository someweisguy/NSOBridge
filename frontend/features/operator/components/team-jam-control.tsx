import { TeamJamUri } from "@/types/query";
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

const checkBoxTheme = createTheme({
  // Hovering over checkbox should change cursor
  cursorType: "pointer",
});

interface TeamJamControlProps extends GroupProps {
  boutUuid: string;
  periodNum: number;
  jamNum: number;
  teamNum: number;

  leadIsDeclared: boolean;

  lead: boolean;
  lost: boolean;
  starPass: boolean;
}

export default function TeamJamControl({
  boutUuid,
  periodNum,
  jamNum,
  teamNum,
  leadIsDeclared,
  lead,
  lost,
  starPass,
  ...props
}: TeamJamControlProps) {
  const teamJamUri: TeamJamUri = { boutUuid, periodNum, jamNum, teamNum };

  const setLead = useTeamJamAddLead({ ...teamJamUri });
  const setLost = useTeamJamAddLost({ ...teamJamUri });
  const setStarPass = useTeamJamAddStarPass({ ...teamJamUri });

  return (
    <MantineProvider theme={checkBoxTheme}>
      <Group justify="center" gap="md" {...props}>
        <Checkbox
          label="Lead"
          checked={lead}
          disabled={leadIsDeclared && !lead}
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
