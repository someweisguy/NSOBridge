import { Button, Group } from "@mantine/core";
import { UseMutationResult } from "@tanstack/react-query";

interface PassEditorProps {
  /**
   * Show the initial pass interface.
   */
  showInitial?: boolean;
  /**
   * The number of passes allowed in a trip.
   */
  numPasses: number;
  /**
   * Mutator which handles adding passes to this TeamJam.
   */
  addPassOnClick?: UseMutationResult<void, unknown, number, unknown>;
}

/**
 * Edits the number of passes in a desired Trip. This component has a special mode when
 * `showInitial` is true. In this mode, an "initial pass" button and a "no pass" button
 * are rendered.
 */
export default function PassEditor({
  showInitial = false,
  numPasses,
  addPassOnClick,
}: PassEditorProps) {
  if (showInitial) {
    return (
      <Group justify="center" gap="md">
        <Button variant="subtle" onClick={() => addPassOnClick?.mutate(0)}>
          No Pass
        </Button>
        <Button variant="outline" onClick={() => addPassOnClick?.mutate(4)}>
          Initial
        </Button>
      </Group>
    );
  }

  return (
    <Group justify="center" gap="md">
      {Array.from({ length: numPasses + 1 }, (_, i) => (
        <Button
          key={i}
          variant={i < numPasses ? "subtle" : "outline"}
          onClick={() => addPassOnClick?.mutate(i)}
        >
          {i}
        </Button>
      ))}
    </Group>
  );
}
