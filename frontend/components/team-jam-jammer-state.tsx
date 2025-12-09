import { jamSetLead, jamSetLost, jamSetStarPass } from "@/lib/game/jams";
import { TeamJam } from "@/types/game";
import { BoutContext, JamContext } from "@/utils/contexts";
import {
  Checkbox,
  createTheme,
  Divider,
  Group,
  MantineProvider,
} from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";

interface JammerStatusButtonsProps {
  teamJam: TeamJam;
}

const checkBoxTheme = createTheme({
  cursorType: "pointer",
});

export default function TeamJamJammerState({
  teamJam,
}: JammerStatusButtonsProps) {
  const bout = useContext(BoutContext);
  const jam = useContext(JamContext);

  const setLead = useMutation({
    mutationFn: (lead: boolean) =>
      jamSetLead(bout!.id, jam!.period, jam!.num, teamJam.teamId, lead),
  });

  const setLost = useMutation({
    mutationFn: (lost: boolean) =>
      jamSetLost(bout!.id, jam!.period, jam!.num, teamJam.teamId, lost),
  });

  const setStarPass = useMutation({
    mutationFn: (starPass: boolean) =>
      jamSetStarPass(bout!.id, jam!.period, jam!.num, teamJam.teamId, starPass),
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
          onClick={() => setLead.mutate(!lead)}
          variant="outline"
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
