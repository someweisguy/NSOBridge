import { useTeamJamAddTrip } from "@/features/jams/hooks/use-team-jam-add-trip";
import { useSuspenseJam } from "@/hooks/use-suspense-jam";
import { useSuspenseRuleset } from "@/hooks/use-suspense-ruleset";
import { TeamJam } from "@/lib/game/jams";
import { Button, Group } from "@mantine/core";

interface TeamJamPassEditorProps {
  boutUuid: string;
  periodNum: number;
  jamNum: number;
  teamJamNum: number;
}

export default function TeamJamPassEditorContainer({
  boutUuid,
  periodNum,
  jamNum,
  teamJamNum,
}: TeamJamPassEditorProps) {
  const { data: ruleset } = useSuspenseRuleset(boutUuid);
  const { data: jam } = useSuspenseJam(boutUuid, periodNum, jamNum);
  const teamJam: TeamJam = jam.teamJams[teamJamNum];

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
