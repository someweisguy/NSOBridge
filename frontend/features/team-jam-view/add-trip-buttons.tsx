import useRuleset from "@/hooks/use-ruleset";
import { jamAddTrip } from "@/lib/game/jams";
import { Jam, Team, TeamJam } from "@/types/game";
import {
  Button,
  Checkbox,
  createTheme,
  Divider,
  Group,
  MantineProvider,
  Stack,
} from "@mantine/core";
import { useMutation } from "@tanstack/react-query";

interface AddTripButtonsProps {
  jam: Jam;
  team: Team;
}

const checkBoxTheme = createTheme({
  cursorType: "pointer",
});

export default function AddTripButtons({ jam, team }: AddTripButtonsProps) {
  const teamJam: TeamJam | undefined = jam.teamJams.find(
    (teamJam: TeamJam) => teamJam.teamId === team.id,
  );
  if (teamJam == undefined) {
    throw new Error("team jam not found");
  }
  const ruleset = useRuleset(jam.boutId);

  const addTrip = useMutation({
    mutationFn: (passes: number) =>
      jamAddTrip(team.boutId, jam.period, jam.num, team.id, passes),
  });

  const lead = teamJam.events.some((tripEvent) => tripEvent.lead);
  const lost = teamJam.events.some((tripEvent) => tripEvent.lost);
  const starPass = teamJam.events.some((tripEvent) => tripEvent.starPass);

  const addTripButtons =
    teamJam.events.length == 0 ? (
      <>
        <Button variant="light" onClick={() => addTrip.mutate(0)}>
          No Pass
        </Button>
        <Button variant="filled" onClick={() => addTrip.mutate(4)}>
          Initial
        </Button>
      </>
    ) : (
      <>
        {Array.from({ length: ruleset.pointsPerTrip + 1 }, (_, i) => (
          <Button
            key={i}
            variant={i == ruleset.pointsPerTrip ? "filled" : "light"}
            onClick={() => addTrip.mutate(i)}
          >
            {i}
          </Button>
        ))}
      </>
    );

  return (
    <Stack justify="center" align="center">
      <Group justify="center" gap="md">
        <MantineProvider theme={checkBoxTheme}>
          <Checkbox label="Lead" checked={lead} variant="outline" />
          <Divider orientation="vertical" />
          <Checkbox label="Lost" checked={lost} variant="outline" />
          <Divider orientation="vertical" />
          <Checkbox label="Star Pass" checked={starPass} variant="outline" />
        </MantineProvider>
      </Group>
      <Group justify="center" gap="md">
        {addTripButtons}
      </Group>
    </Stack>
  );
}
