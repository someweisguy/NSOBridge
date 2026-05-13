import { TripEvent } from "@/types/jam";
import { TeamJamUri } from "@/types/query";
import {
  Card,
  Checkbox,
  createTheme,
  Divider,
  Group,
  MantineProvider,
  Stack,
} from "@mantine/core";
import { IconStarFilled } from "@tabler/icons-react";
import { useTeamJamAddLead } from "../hooks/use-team-jam-add-lead";
import { useTeamJamAddLost } from "../hooks/use-team-jam-add-lost";
import { useTeamJamAddStarPass } from "../hooks/use-team-jam-add-star-pass";
import TeamJamTripHistory from "./team-jam-trip-history";

const checkBoxTheme = createTheme({
  // Hovering over checkbox should change cursor
  cursorType: "pointer",
});

interface TeamJamControlProps {
  boutUuid: string;
  periodNum: number;
  jamNum: number;
  teamNum: number;

  isLeadEligible: boolean;

  pointsPerTrip: number;
  events: TripEvent[];
}

export default function TeamJamControl({
  boutUuid,
  periodNum,
  jamNum,
  teamNum,
  isLeadEligible,
  pointsPerTrip,
  events,
}: TeamJamControlProps) {
  const teamJamUri: TeamJamUri = { boutUuid, periodNum, jamNum, teamNum };

  const setLead = useTeamJamAddLead({ ...teamJamUri });
  const setLost = useTeamJamAddLost({ ...teamJamUri });
  const setStarPass = useTeamJamAddStarPass({ ...teamJamUri });

  const lead = events.some((event) => event.lead);
  const lost = events.some((event) => event.lost);
  const starPass = events.some((event) => event.starPass);

  return (
    <MantineProvider theme={checkBoxTheme}>
      <Card withBorder bg="gray.0">
        <Stack>
          <Group justify="center" gap="md">
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
          <TeamJamTripHistory
            numPasses={pointsPerTrip}
            teamJamUri={teamJamUri}
            events={events}
          />
        </Stack>
      </Card>
    </MantineProvider>
  );
}
