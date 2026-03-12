import { useSuspenseJam } from "@/hooks/use-suspense-jam";
import { Jam } from "@/lib/game/jams";
import { TeamJamUri } from "@/types/query";
import TeamJamTripHistory from "./team-jam-trip-history";

/**
 * Display the Trips that a Jammer has completed within a desired Jam.
 */
export default function TeamJamTripHistoryContainer({
  boutUuid,
  periodNum,
  jamNum,
  teamNum,
}: TeamJamUri) {
  const { data: teamJam } = useSuspenseJam({
    boutUuid,
    periodNum,
    jamNum,
    select: (jam: Jam) => jam.teamJams.find((tj) => tj.teamNum == teamNum),
  });
  if (teamJam == null) {
    throw new Error("Unable to find TeamJam");
  }

  return <TeamJamTripHistory events={teamJam.events} />;
}
