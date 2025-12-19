import { TeamJam } from "@/lib/game/jams";
import {
  Checkbox,
  createTheme,
  Divider,
  Group,
  MantineProvider,
} from "@mantine/core";
import { IconStarFilled } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";

interface JammerStatusButtonsProps {
  teamJam: TeamJam;
}

const checkBoxTheme = createTheme({
  cursorType: "pointer",
});

export default function TeamJamJammerState({
  teamJam,
}: JammerStatusButtonsProps) {
  const setLead = useMutation({
    mutationFn: (lead: boolean) => teamJam.jamSetLead(lead),
  });

  const setLost = useMutation({
    mutationFn: (lost: boolean) => teamJam.jamSetLost(lost),
  });

  const setStarPass = useMutation({
    mutationFn: (starPass: boolean) => teamJam.jamSetStarPass(starPass),
  });

  const lead = teamJam.events.some((tripEvent) => tripEvent.lead);
  const lost = teamJam.events.some((tripEvent) => tripEvent.lost);
  const starPass = teamJam.events.some((tripEvent) => tripEvent.starPass);

  return (
    <Group justify="center" gap="md">
      <MantineProvider theme={checkBoxTheme}>
        <Checkbox
          label="Lead"
          checked={lead}
          disabled={lost}
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
