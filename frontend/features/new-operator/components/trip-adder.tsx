import { Team } from "@/types/bout";
import { Button, Group, GroupProps } from "@mantine/core";
import { useCreateTrip } from "../hooks/use-create-trip";

export interface TripAdderProps extends Omit<GroupProps, "children"> {
  team: Team;
  pointsPerTrip: number;
}

export default function TripAdder({
  team,
  pointsPerTrip,
  ...props
}: TripAdderProps) {
  const { mutate: createTrip } = useCreateTrip({ team });
  return (
    <Group justify="space-between" align="center" wrap="nowrap" {...props}>
      {Array.from({ length: pointsPerTrip + 1 }, (_, i) => (
        <Button
          key={i}
          variant={i == pointsPerTrip ? "light" : "subtle"}
          onClick={() => createTrip(i)}
        >
          {i}
        </Button>
      ))}
    </Group>
  );
}
