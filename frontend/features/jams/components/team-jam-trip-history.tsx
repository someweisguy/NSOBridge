import ResponsiveScroller from "@/components/responsive-scroller";
import TripEventButton from "@/features/jams/components/trip-event-button";
import { TripEvent } from "@/types/jam";
import { ScrollAreaAutosizeProps } from "@mantine/core";

interface TeamJamTripHistoryProps extends ScrollAreaAutosizeProps {
  events: TripEvent[];
}

export default function TeamJamTripHistory({
  events,
}: TeamJamTripHistoryProps) {
  return (
    <ResponsiveScroller>
      {events
        .filter((event) => event.passes != null)
        .map((teamJam, i) => (
          <TripEventButton key={i} tripNum={i} {...teamJam} />
        ))}
    </ResponsiveScroller>
  );
}
