import { useSuspenseJam } from "@/hooks/use-suspense-jam";
import { Jam } from "@/lib/game/jams";
import { ScrollAreaAutosizeProps } from "@mantine/core";
import TeamJamTripHistory from "./team-jam-trip-history";

interface TeamJamTripHistoryContainerProps extends ScrollAreaAutosizeProps {
  boutUuid: string;
  periodNum: number;
  jamNum: number;
  teamJamNum: number;
}

export default function TeamJamTripHistoryContainer({
  boutUuid,
  periodNum,
  jamNum,
  teamJamNum,
}: TeamJamTripHistoryContainerProps) {
  const { data: teamJam } = useSuspenseJam({
    boutUuid,
    periodNum,
    jamNum,
    select: (jam: Jam) => jam.teamJams[teamJamNum],
  });

  return <TeamJamTripHistory events={teamJam.events} />;
}
