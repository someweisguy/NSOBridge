import { TeamJamUri } from "@/types/query";
import { Button, Group, ScrollAreaAutosizeProps } from "@mantine/core";
import { useTeamJamAddTrip } from "../hooks/use-team-jam-add-trip";

interface TeamJamTripHistoryProps extends ScrollAreaAutosizeProps {
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
      <Button variant="light" onClick={() => addTrip.mutate(4)}>
        Initial
      </Button>
    </>
  ) : (
    Array.from({ length: numPasses + 1 }, (_, i) => (
      <Button
        key={i}
        variant={i < numPasses ? "subtle" : "light"}
        onClick={() => addTrip.mutate(i)}
      >
        {i}
      </Button>
    ))
  );

  return <Group>{passButtons}</Group>;
}
