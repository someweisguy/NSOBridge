import { Button, Stack, Text } from "@mantine/core";

interface TripEventButtonProps {
  /**
   * The Trip number, zero indexed.
   */
  tripNum: number;
  /**
   * The number of passes to display.
   */
  passes: number | null;
}

/**
 * Display a Jammer trip.
 */
export default function TripEventButton({
  tripNum,
  passes,
}: TripEventButtonProps) {
  return (
    <Button px={0} variant="subtle" c="gray" w="50" h="60">
      <Stack gap={3}>
        <Text fs="italic" c="dimmed" size="8pt">
          Trip {tripNum + 1}
        </Text>
        <Text c="dark" fw="bold" size="md">
          {passes}
        </Text>
      </Stack>
    </Button>
  );
}
