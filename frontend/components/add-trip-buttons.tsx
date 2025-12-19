import { useAddTrip } from "@/hooks/use-jam";
import { TeamJam } from "@/lib/game/jams";
import { Ruleset } from "@/types/game";
import { Button, Group, Stack } from "@mantine/core";

interface AddTripButtonsProps {
  teamJam: TeamJam;
  ruleset: Ruleset;
}

export default function AddTripButtons({
  teamJam,
  ruleset,
}: AddTripButtonsProps) {
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
