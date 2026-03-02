import { Button, Group } from "@mantine/core";
import { UseMutationResult } from "@tanstack/react-query";

interface PassEditorProps {
  showInitial?: boolean;
  numPasses: number;
  addPassOnClick?: UseMutationResult<void, unknown, number, unknown>;
}

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
      {Array.from({ length: numPasses }, (_, i) => (
        <Button
          key={i}
          variant={i == numPasses ? "outline" : "subtle"}
          onClick={() => addPassOnClick?.mutate(i)}
        >
          {i}
        </Button>
      ))}
    </Group>
  );
}
