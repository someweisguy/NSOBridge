import { TripEvent } from "@/types/jam";
import { ActionIcon, Card, NumberInput } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { IconTrash } from "@tabler/icons-react";

interface JammerTripProps extends TripEvent {
  tripIndex: number;
  pointsPerTrip: number;
}

export default function JammerTrip({
  tripIndex,
  passes,
  pointsPerTrip,
}: JammerTripProps) {
  const { hovered, ref } = useHover();

  return (
    <Card withBorder ref={ref} w="fit-content" px="0.25rem" py="0.5rem">
      <NumberInput
        size="xs"
        variant="unstyled"
        clampBehavior="strict"
        maw="80px"
        ta="center"
        min={0}
        max={pointsPerTrip}
        value={passes ?? 0}
        allowDecimal={false}
        label={"Trip " + (tripIndex + 1)}
        hideControls={!hovered}
        stepHoldDelay={250}
        leftSection={
          hovered && (
            <ActionIcon variant="transparent" color="red">
              <IconTrash size={16} />
            </ActionIcon>
          )
        }
        leftSectionWidth={24}
        rightSectionWidth={24}
        placeholder="0"
        styles={{ input: { textAlign: "center" } }}
      />
    </Card>
  );
}
