import { Button, Group, GroupProps } from "@mantine/core";
import { useTeamJamAddTrip } from "../hooks/use-team-jam-add-trip";

interface PassEditorProps {
  /**
   * Show the initial pass interface.
   */
  showInitial?: boolean;
  /**
   * The number of passes allowed in a trip.
   */
  numPasses: number;
  boutUuid: string;
  periodNum: number;
  jamNum: number;
  teamNum: number;
}

/**
 * Edits the number of passes in a desired Trip. This component has a special mode when
 * `showInitial` is true. In this mode, an "initial pass" button and a "no pass" button
 * are rendered.
 */
export default function PassEditor({
  showInitial = false,
  numPasses,
  boutUuid,
  periodNum,
  jamNum,
  teamNum,
  ...props
}: PassEditorProps & GroupProps) {
  const addTrip = useTeamJamAddTrip({
    boutUuid,
    periodNum,
    jamNum,
    teamNum,
  });

  if (showInitial) {
    return (
      <Group justify="center" gap="md" {...props}>
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
    <Group justify="center" gap="md" {...props}>
      {Array.from({ length: numPasses + 1 }, (_, i) => (
        <Button
          key={i}
          variant={i < numPasses ? "subtle" : "outline"}
          onClick={() => addTrip.mutate(i)}
        >
          {i}
        </Button>
      ))}
    </Group>
  );
}
