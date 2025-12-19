import { useAddTrip } from "@/hooks/use-jam";
import { useRuleset } from "@/hooks/use-ruleset";
import { Team } from "@/lib/game/bouts";
import { Jam, TeamJam } from "@/lib/game/jams";
import { Button, Group, Stack } from "@mantine/core";

interface AddTripButtonsProps {
  jam: Jam;
  team: Team;
}

export default function AddTripButtons({ jam, team }: AddTripButtonsProps) {
  const teamJam: TeamJam | undefined = jam.teamJams.find(
    (teamJam: TeamJam) => teamJam.teamId === team.id,
  );
  if (teamJam == undefined) {
    throw new Error("team jam not found");
  }
  const { data: ruleset } = useRuleset(jam.boutId);
  const addTrip = useAddTrip(teamJam);

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
        {addTripButtons}
      </Group>
    </Stack>
  );
}
