import { Button, Stack, Text, useMantineTheme } from "@mantine/core";

interface TeamJamProps {
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
}: TeamJamProps) {
  // TODO: Polish this component
  const theme = useMantineTheme();

  return (
    <Button px={0} variant="subtle" c="gray" w={50} h={60}>
      <Stack gap={3}>
        <Text c="dimmed" size="9pt">
          <i>Trip {tripNum + 1}</i>
        </Text>
        <Text c={theme.colors.dark[9]} size="md">
          <b>{passes}</b>
        </Text>
      </Stack>
    </Button>
  );
}
