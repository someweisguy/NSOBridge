import ResponsiveScroller from "@/components/responsive-scroller";
import { TripEvent } from "@/types/jam";
import { TeamJamUri } from "@/types/query";
import {
  Button,
  Card,
  Group,
  ScrollAreaAutosizeProps,
  Stack,
  Text,
} from "@mantine/core";
import { useTeamJamAddTrip } from "../hooks/use-team-jam-add-trip";

interface TeamJamTripHistoryProps extends ScrollAreaAutosizeProps {
  events: TripEvent[];
  /**
   * Show the initial pass interface.
   */
  showInitial?: boolean;
  /**
   * The number of passes allowed in a trip.
   */
  numPasses: number;
  teamJamUri: TeamJamUri;
}

export default function TeamJamTripHistory({
  events,
  showInitial = false,
  numPasses,
  teamJamUri,
}: TeamJamTripHistoryProps) {
  const addTrip = useTeamJamAddTrip({ ...teamJamUri });

  const passButtons = showInitial ? (
    <>
      <Button variant="subtle" onClick={() => addTrip.mutate(0)}>
        No Pass
      </Button>
      <Button variant="outline" onClick={() => addTrip.mutate(4)}>
        Initial
      </Button>
    </>
  ) : (
    Array.from({ length: numPasses + 1 }, (_, i) => (
      <Button
        key={i}
        variant={i < numPasses ? "subtle" : "outline"}
        onClick={() => addTrip.mutate(i)}
      >
        {i}
      </Button>
    ))
  );

  return (
    <Stack align="center">
      <Group>{passButtons}</Group>
      <Card withBorder>
        <ResponsiveScroller>
          {events
            .filter((event) => event.passes != null)
            .map((event: TripEvent, i: number) => (
              <Button key={i} px={0} variant="subtle" c="gray" w="50" h="60">
                <Stack gap={3}>
                  <Text fs="italic" c="dimmed" size="8pt">
                    Trip {i + 1}
                  </Text>
                  <Text c="dark" fw="bold" size="md">
                    {event.passes}
                  </Text>
                </Stack>
              </Button>
            ))}
        </ResponsiveScroller>
      </Card>
    </Stack>
  );
}
