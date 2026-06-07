import { TripEvent } from "@/types/jam";
import { TeamJamUri } from "@/types/query";
import { ActionIcon, Card, CardProps, NumberInput } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { IconTrash } from "@tabler/icons-react";
import { useDeleteTripEvent } from "../hooks/use-delete-trip-event";
import { useSetTripEventPasses } from "../hooks/use-set-trip-event-passes";

interface JammerTripProps extends TripEvent, CardProps {
  teamJamUri: TeamJamUri;
  tripIndex: number;
  pointsPerTrip: number;
}

export default function JammerTrip({
  teamJamUri,
  tripIndex,
  passes,
  pointsPerTrip,
  uuid,
  ...props
}: JammerTripProps) {
  const { hovered, ref } = useHover();
  const setTripPasses = useSetTripEventPasses({
    eventUuid: uuid,
    ...teamJamUri,
  });
  const deleteTrip = useDeleteTripEvent({ eventUuid: uuid, ...teamJamUri });

  return (
    <Card
      withBorder
      ref={ref}
      w="fit-content"
      px="0.25rem"
      py="0.5rem"
      {...props}
    >
      <NumberInput
        size="xs"
        variant="unstyled"
        clampBehavior="strict"
        maw="80px"
        ta="center"
        placeholder="0"
        min={0}
        max={pointsPerTrip}
        value={passes ?? 0}
        allowDecimal={false}
        label={"Trip " + (tripIndex + 1)}
        hideControls={!hovered}
        leftSection={
          hovered && (
            <ActionIcon
              variant="transparent"
              color="red"
              onClick={() => deleteTrip.mutate()}
            >
              <IconTrash size={16} />
            </ActionIcon>
          )
        }
        leftSectionWidth={24}
        rightSectionWidth={24}
        onChange={(value) => setTripPasses.mutate(Number(value))}
        styles={{ input: { textAlign: "center", pointerEvents: "none" } }}
        onFocusCapture={(event) => event.currentTarget.blur()}
      />
    </Card>
  );
}
