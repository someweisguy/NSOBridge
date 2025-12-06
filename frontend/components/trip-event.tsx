import { Card, Center, Text } from "@mantine/core";

interface TeamJamProps {
  tripNum: number;
  timestamp: Date;
  lead: boolean;
  lost: boolean;
  passes: number | null;
  starPass: boolean;
}

const w = 75;

export default function TripEvent({
  tripNum,
  // timestamp,
  // lead,
  // lost,
  passes,
  // starPass,
}: TeamJamProps) {
  // TODO: Polish this component
  return (
    <Card shadow="sm" radius="md" withBorder w={w} h={w}>
      <Card.Section>
        <Center>
          <Text size="sm">Trip {tripNum + 1}</Text>
        </Center>
      </Card.Section>

      <Card.Section>
        <Center>
          <Text size="sm">{passes}</Text>
        </Center>
      </Card.Section>
    </Card>
  );
}
