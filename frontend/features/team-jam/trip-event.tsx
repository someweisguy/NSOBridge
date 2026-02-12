import { Button, Stack, Text, useMantineTheme } from "@mantine/core";

interface TripEventProps {
  tripNum: number;
  timestamp: Date;
  lead: boolean;
  lost: boolean;
  passes: number | null;
  starPass: boolean;
}

export default function TripEvent({
  tripNum,
  // timestamp,
  // lead,
  // lost,
  passes,
  // starPass,
}: TripEventProps) {
  // TODO: Polish this component
  const theme = useMantineTheme();

  return (
    <Button px={0} variant="subtle" c="gray" w={50} h={60}>
      <Stack gap={3}>
        <Text fs="italic" c="dimmed" size="9pt">
          Trip {tripNum + 1}
        </Text>
        <Text fw="bold" c={theme.colors.dark[9]} size="md">
          {passes}
        </Text>
      </Stack>
    </Button>
  );
}
