import { TripEvent } from "@/types/jam";
import { ActionIcon, NumberInput, Paper, PaperProps, px } from "@mantine/core";
import { useHover, useMergedRef } from "@mantine/hooks";
import { IconTrash } from "@tabler/icons-react";
import { RefObject } from "react";
import { useDeleteTripEvent } from "../hooks/use-delete-trip-event";
import { useUpdateTripEvent } from "../hooks/use-update-trip-event";

const deleteTripIconSize = 16;

interface JammerTripProps extends TripEvent, PaperProps {
  tripIndex: number;
  pointsPerTrip: number;
  enableEdit?: boolean;
  enableDelete?: boolean;
  ref?: RefObject<HTMLDivElement | null>;
}

export default function JammerTrip({
  uuid,
  tripIndex,
  passes,
  pointsPerTrip,
  enableEdit = true,
  enableDelete = true,
  ref,
  ...props
}: JammerTripProps) {
  const { hovered, ref: hoverRef } = useHover();
  const mergedRef = useMergedRef(hoverRef, ref);

  const { mutate: updateTripEvent } = useUpdateTripEvent({ uuid });
  const { mutate: deleteTrip } = useDeleteTripEvent({ uuid });

  return (
    <Paper withBorder ref={mergedRef} {...props}>
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
        hideControls={!hovered || !enableEdit}
        leftSection={
          hovered &&
          enableDelete && (
            <ActionIcon
              variant="transparent"
              color="red"
              onClick={() => deleteTrip()}
            >
              <IconTrash size={px(deleteTripIconSize)} />
            </ActionIcon>
          )
        }
        leftSectionWidth={24}
        rightSectionWidth={24}
        onChange={(value) => updateTripEvent({ passes: Number(value) })}
        styles={{ input: { textAlign: "center", pointerEvents: "none" } }}
        onFocusCapture={(event) => event.currentTarget.blur()}
      />
    </Paper>
  );
}
