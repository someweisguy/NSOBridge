import { useTeamJamAddTrip } from "@/features/operator/hooks/use-team-jam-add-trip";
import { Jam, TeamJam } from "@/lib/game/jams";
import { JamContext, RulesetContext, TeamJamContext } from "@/utils/contexts";
import { Button, Group } from "@mantine/core";
import { useContext } from "react";

export default function TeamJamPassEditor() {
  const jam: Jam | null = useContext(JamContext);
  const teamJam: TeamJam | null = useContext(TeamJamContext);
  if (teamJam == null || jam == null) {
    throw new Error("AddTripButtons must be in a TeamJamProvider");
  }
  const ruleset = useContext(RulesetContext);
  if (ruleset == null) {
    throw new Error("AddTripButtons must be inside a RulesetProvider");
  }
  const addTrip = useTeamJamAddTrip(jam, teamJam);

  // Get the number of Trips
  const numTrips = teamJam.events.filter(
    (tripEvent) => tripEvent.passes != null,
  ).length;

  if (numTrips == 0) {
    return (
      <Group justify="center" gap="md">
        <Button variant="subtle" onClick={() => addTrip.mutate(0)}>
          No Pass
        </Button>
        <Button variant="outline" onClick={() => addTrip.mutate(4)}>
          Initial
        </Button>
      </Group>
    );
  }

  return (
    <Group justify="center" gap="md">
      {Array.from({ length: ruleset.pointsPerTrip + 1 }, (_, i) => (
        <Button
          key={i}
          variant={i == ruleset.pointsPerTrip ? "outline" : "subtle"}
          onClick={() => addTrip.mutate(i)}
        >
          {i}
        </Button>
      ))}
    </Group>
  );
}
