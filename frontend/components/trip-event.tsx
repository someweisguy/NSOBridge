import { Card, CardSection } from "@mantine/core";

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
  return (
    <Card>
      <CardSection>Trip {tripNum + 1}</CardSection>
      <CardSection>{passes}</CardSection>
    </Card>
  );
}
