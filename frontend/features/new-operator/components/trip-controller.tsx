import { Team } from "@/types/bout";
import { Jam, TripEvent } from "@/types/jam";
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

const deleteTripIconSize = 16;

const altTextStyle: TextProps = {
  fz: "xs",
  ta: "center",
  fs: "italic",
  fw: 250,
  c: "dimmed",
};

export interface TripControllerProps extends Omit<ScrollerProps, "children"> {
  jam: Jam;
  team: Team;
  editable?: boolean;
  deletable?: boolean;
  pointsPerTrip: number;
}

export default function TripController({
  jam,
  team,
  pointsPerTrip,
  editable = true,
  deletable = true,
  ...props
}: TripControllerProps) {
  const teamJam = jam.teamJams.find((teamJam) => teamJam.teamUuid == team.uuid);
  const teamJamNotInJam = teamJam == null;
  const teamJamHasNoTrips = teamJam?.events.length == 0;

  const latestTripRef = useRef<HTMLDivElement>(null);

  // Scroll to the latest Trip whenever the number of Trips increases
  const reduceMotion = useReducedMotion();
  const childrenCount = useRef<number>(0);
  useEffect(() => {
    const newChildrenCount: number = teamJam?.events.length ?? 0;
    latestTripRef?.current?.scrollIntoView({
      behavior: reduceMotion ? "instant" : "smooth",
      inline: "center",
    });
    childrenCount.current = newChildrenCount;
  }, [teamJam?.events.length, reduceMotion]);

  return (
    <Scroller ta="center" {...props}>
      {teamJamNotInJam && (
        <Text {...altTextStyle}>This Team is not in the Jam</Text>
      )}
      {teamJamHasNoTrips && (
        <Text {...altTextStyle}>There are no Trips to display.</Text>
      )}
      <Group grow justify="start" gap="xs" wrap="nowrap">
        {teamJam?.events
          .filter((tripEvent) => tripEvent.passes != null)
          .map((tripEvent: TripEvent, i: number) => (
            <JammerTrip
              key={tripEvent.uuid}
              ref={latestTripRef}
              enableEdit={editable}
              enableDelete={deletable}
              tripIndex={i}
              pointsPerTrip={pointsPerTrip}
              w="4rem"
              h="3.5rem"
              {...tripEvent}
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
  // uuid,
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

  // const setTripPasses = useSetTripEventPasses({
  //   eventUuid: uuid,
  //   ...teamJamUri,
  // });
  // const deleteTrip = useDeleteTripEvent({ eventUuid: uuid, ...teamJamUri });

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
              // onClick={() => deleteTrip.mutate()}
            >
              <IconTrash size={px(deleteTripIconSize)} />
            </ActionIcon>
          )
        }
        leftSectionWidth={24}
        rightSectionWidth={24}
        // onChange={(value) => setTripPasses.mutate(Number(value))}
        styles={{ input: { textAlign: "center", pointerEvents: "none" } }}
        onFocusCapture={(event) => event.currentTarget.blur()}
      />
    </Paper>
  );
}
