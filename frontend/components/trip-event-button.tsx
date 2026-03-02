import { Button, Stack, Text } from "@mantine/core";

interface TripEventProps {
  tripNum: number;
  passes: number | null;
}

export default function TripEventButton({ tripNum, passes }: TripEventProps) {
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
