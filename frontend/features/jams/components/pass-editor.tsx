import { Button, Group, GroupProps } from "@mantine/core";
import { useTeamJamAddTrip } from "../hooks/use-team-jam-add-trip";
import { TeamJamUri } from "@/types/query";

interface PassEditorProps {
  /**
   * Show the initial pass interface.
   */
  showInitial?: boolean;
  /**
   * The number of passes allowed in a trip.
   */
  numPasses: number;
  teamJamUri: TeamJamUri;
}

/**
 * Edits the number of passes in a desired Trip. This component has a special mode when
 * `showInitial` is true. In this mode, an "initial pass" button and a "no pass" button
 * are rendered.
 */
export default function PassEditor({
  showInitial = false,
  numPasses,
  teamJamUri,
  ...props
}: PassEditorProps & GroupProps) {
  const addTrip = useTeamJamAddTrip({ ...teamJamUri });

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
