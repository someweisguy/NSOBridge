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
import { useHover, useMergedRef, useScroller } from "@mantine/hooks";
import { IconTrash } from "@tabler/icons-react";
import { useRef } from "react";

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

  const { ref: scrollerRef } = useScroller();
  const htmlRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRef(scrollerRef, htmlRef);

  // TODO: make scroller work

  return (
    <Stack>
      <Group justify="space-between" align="center">
        {Array.from({ length: pointsPerTrip + 1 }, (_, i) => (
          <Button key={i} variant={i == pointsPerTrip ? "light" : "subtle"}>
            {i}
          </Button>
        ))}
      </Group>
      <Scroller ref={mergedRef} ta="center" {...props}>
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
  // teamJamUri: TeamJamUri;
  tripIndex: number;
  pointsPerTrip: number;
}

function JammerTrip({
  // teamJamUri,
  tripIndex,
  passes,
  pointsPerTrip,
  // uuid,
  ...props
}: JammerTripProps) {
  const { hovered, ref } = useHover();
  // const setTripPasses = useSetTripEventPasses({
  //   eventUuid: uuid,
  //   ...teamJamUri,
  // });
  // const deleteTrip = useDeleteTripEvent({ eventUuid: uuid, ...teamJamUri });

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
