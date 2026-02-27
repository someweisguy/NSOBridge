import { useSuspenseJam } from "@/hooks/use-suspense-jam";
import { Bout } from "@/lib/game/bouts";
import { Jam } from "@/lib/game/jams";
import { ScrollAreaAutosizeProps } from "@mantine/core";
import TeamJamTripHistory from "./team-jam-trip-history";

interface TeamJamTripHistoryContainerProps extends ScrollAreaAutosizeProps {
  bout: Bout;
  periodNum: number;
  jamNum: number;
  teamJamNum: number;
}

export default function TeamJamTripHistoryContainer({
  bout,
  periodNum,
  jamNum,
  teamJamNum,
}: TeamJamTripHistoryContainerProps) {
  const { data: teamJam } = useSuspenseJam(bout, periodNum, jamNum, {
    select: (jam: Jam) => jam.teamJams[teamJamNum],
  });

  return <TeamJamTripHistory events={teamJam.events} />;
}
