import { useAddTrip } from "@/hooks/use-jam";
import { Jam, TeamJam } from "@/lib/game/jams";
import { JamContext, RulesetContext, TeamJamContext } from "@/utils/contexts";
import { Button, Group, Stack } from "@mantine/core";
import { useContext } from "react";

export default function PassEditor() {
  const jam: Jam | null = useContext(JamContext);
  const teamJam: TeamJam | null = useContext(TeamJamContext);
  if (teamJam == null || jam == null) {
    throw new Error("AddTripButtons must be in a TeamJamProvider");
  }
  const ruleset = useContext(RulesetContext);
  if (ruleset == null) {
    throw new Error("AddTripButtons must be inside a RulesetProvider");
  }
  const addTrip = useAddTrip(jam, teamJam);

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
