import { Team } from "@/types/bout";
import { Jam, TripEvent } from "@/types/jam";
import {
  ActionIcon,
  Button,
  Card,
  CardProps,
  Group,
  NumberInput,
  Scroller,
  ScrollerProps,
  Stack,
  Text,
  TextProps,
} from "@mantine/core";
import { useHover, useMergedRef, useReducedMotion } from "@mantine/hooks";
import { IconTrash } from "@tabler/icons-react";
import { RefObject, useEffect, useRef } from "react";
import { useCreateTrip } from "../hooks/use-create-trip";

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
  pointsPerTrip: number;
}

export default function TripController({
  jam,
  team,
  pointsPerTrip,
  ...props
}: TripControllerProps) {
  const teamJam = jam.teamJams.find((teamJam) => teamJam.teamUuid == team.uuid);
  const teamJamNotInJam = teamJam == null;
  const teamJamHasNoTrips = teamJam?.events.length == 0;

  const latestTripRef = useRef<HTMLDivElement>(null);
  const { mutate: createTrip } = useCreateTrip({ team });

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
    <Stack justify="start" align="stretch" maw="400px" px="xl">
      <Group justify="space-between" align="center" wrap="nowrap">
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
      <Scroller ta="center" w="100%" {...props}>
        {teamJamNotInJam && (
          <Text {...altTextStyle}>This Team is not in the Jam</Text>
        )}
        {teamJamHasNoTrips && (
          <Text {...altTextStyle}>There are no Trips to display.</Text>
        )}
        <Group justify="start" align="center" gap="xs" wrap="nowrap">
          {teamJam?.events
            .filter((tripEvent) => tripEvent.passes != null)
            .map((tripEvent: TripEvent, i: number) => (
              <JammerTrip
                key={tripEvent.uuid}
                ref={latestTripRef}
                tripIndex={i}
                pointsPerTrip={4} // TODO: pass a ruleset
                {...tripEvent}
              />
            ))}
        </Group>
      </Scroller>
    </Stack>
  );
}

interface JammerTripProps extends TripEvent, CardProps {
  tripIndex: number;
  pointsPerTrip: number;
  ref?: RefObject<HTMLDivElement | null>;
}

function JammerTrip({
  tripIndex,
  passes,
  pointsPerTrip,
  // uuid,
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
    <Card
      withBorder
      ref={mergedRef}
      miw="fit-content"
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
              // onClick={() => deleteTrip.mutate()}
            >
              <IconTrash size={16} />
            </ActionIcon>
          )
        }
        leftSectionWidth={24}
        rightSectionWidth={24}
        // onChange={(value) => setTripPasses.mutate(Number(value))}
        styles={{ input: { textAlign: "center", pointerEvents: "none" } }}
        onFocusCapture={(event) => event.currentTarget.blur()}
      />
    </Card>
  );
}
