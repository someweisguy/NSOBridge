import { TripEvent } from "@/types/jam";
import { Group, Scroller, ScrollerProps, Text, TextProps } from "@mantine/core";
import { useReducedMotion } from "@mantine/hooks";
import { useEffect, useRef } from "react";
import JammerTrip from "./jammer-trip";

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
