import { Button, Group, GroupProps } from "@mantine/core";
import { useAddTrip } from "../hooks/use-add-trip";

export interface TripAdderProps extends Omit<GroupProps, "children"> {
  teamUuid: string;
  showInitial: boolean;
  pointsPerTrip: number;
}

// TODO: docs
export default function TripAdder({
  teamUuid,
  showInitial,
  pointsPerTrip,
  ...props
}: TripAdderProps) {
  const { mutate: createTrip } = useAddTrip({ teamUuid });

  return (
    <Group justify="space-around" align="center" wrap="nowrap" {...props}>
      {showInitial ? (
        <>
          <Button variant="subtle" onClick={() => createTrip(0)}>
            No Pass
          </Button>
          <Button variant="light" onClick={() => createTrip(pointsPerTrip)}>
            Initial
          </Button>
        </>
      ) : (
        Array.from({ length: pointsPerTrip + 1 }, (_, i) => (
          <Button
            key={i}
            variant={i == pointsPerTrip ? "light" : "subtle"}
            onClick={() => createTrip(i)}
          >
            {i}
          </Button>
        ))
      )}
    </Group>
  );
}
