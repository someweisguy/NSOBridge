import { TripEvent } from "@/types/jam";
import {
  ActionIcon,
  Group,
  NumberInput,
  Paper,
  PaperProps,
  px,
  Scroller,
  ScrollerProps,
  Text,
  TextProps,
} from "@mantine/core";
import { useHover, useMergedRef, useReducedMotion } from "@mantine/hooks";
import { IconTrash } from "@tabler/icons-react";
import { RefObject, useEffect, useRef } from "react";
import { useDeleteTripEvent } from "../hooks/use-delete-trip-event";
import { useUpdateTripEvent } from "../hooks/use-update-trip-event";

const deleteTripIconSize = 16;

const altTextStyle: TextProps = {
  fz: "xs",
  ta: "center",
  fs: "italic",
  fw: 250,
  c: "dimmed",
};

export interface TripControllerProps extends Omit<ScrollerProps, "children"> {
  teamIsInThisJam: boolean;
  tripEvents: TripEvent[];
  editable?: boolean;
  deletable?: boolean;
  pointsPerTrip: number;
}

export default function TripController({
  teamIsInThisJam,
  pointsPerTrip,
  tripEvents,
  editable = true,
  deletable = true,
  ...props
}: TripControllerProps) {
  const latestTripRef = useRef<HTMLDivElement>(null);

  // Scroll to the latest Trip whenever the number of Trips increases
  const reduceMotion = useReducedMotion();
  const childrenCount = useRef<number>(0);
  useEffect(() => {
    const newChildrenCount: number = tripEvents.length ?? 0;
    latestTripRef?.current?.scrollIntoView({
      behavior: reduceMotion ? "instant" : "smooth",
      inline: "center",
    });
    childrenCount.current = newChildrenCount;
  }, [tripEvents.length, reduceMotion]);

  const jammerInitial = tripEvents.length > 0;

  return (
    <Scroller
      ta={!teamIsInThisJam || !jammerInitial ? "center" : "start"}
      {...props}
    >
      {!teamIsInThisJam && (
        <Text {...altTextStyle}>This Team is not in the Jam</Text>
      )}
      {!jammerInitial && (
        <Text {...altTextStyle}>There are no Trips to display.</Text>
      )}
      <Group grow justify="start" gap="xs" wrap="nowrap" w="100%">
        {tripEvents
          .filter((tripEvent) => tripEvent.passes != null)
          .map((tripEvent: TripEvent, i: number) => (
            <JammerTrip
              key={tripEvent.uuid}
              ref={latestTripRef}
              uuid={tripEvent.uuid}
              timestamp={tripEvent.timestamp}
              lead={tripEvent.lead}
              lost={tripEvent.lost}
              starPass={tripEvent.starPass}
              passes={tripEvent.passes}
              tripIndex={i}
              enableEdit={editable}
              enableDelete={deletable}
              pointsPerTrip={pointsPerTrip}
              w="4rem"
              h="3.5rem"
            />
          ))}
      </Group>
    </Scroller>
  );
}

interface JammerTripProps extends TripEvent, PaperProps {
  tripIndex: number;
  pointsPerTrip: number;
  enableEdit?: boolean;
  enableDelete?: boolean;
  ref?: RefObject<HTMLDivElement | null>;
}

function JammerTrip({
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
