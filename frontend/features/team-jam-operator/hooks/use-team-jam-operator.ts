import { useSuspenseBout } from "@/hooks/game/use-bout";
import { useSuspenseJam } from "@/hooks/game/use-jam";
import { useTimeout } from "@/hooks/game/use-timeout";
import { Team } from "@/types/bout";
import { Jam, TeamJam } from "@/types/jam";
import { Timeout } from "@/types/timeout";
import { isRunning } from "@/utils/time";
import { useMemo } from "react";

// TODO: docs
export const useTeamJamOperator = (team: Team) => {
  // Fetch Bout; should already be cached
  const { data: bout } = useSuspenseBout({ uuid: team.boutUuid });

  // Get information about the this Team's active TeamJam
  const { data: teamJam } = useSuspenseJam({
    uuid: bout.activeJamUuid,
    select: (activeJam: Jam) =>
      activeJam.teamJams.find(
        (teamJam: TeamJam) => team.uuid == teamJam.teamUuid,
      ),
  });
  const { data: leadIsDeclared } = useSuspenseJam({
    uuid: bout.activeJamUuid,
    select: (activeJam: Jam) =>
      activeJam.teamJams.some((teamJam) =>
        teamJam.events.some((event) => event.lead),
      ),
  });
  const jammerInitial = teamJam?.events.some((t) => t.passes != null) ?? false;
  const jammerState: "lead" | "lost" | "starPass" | null = useMemo(() => {
    if (teamJam?.events.some((event) => event.starPass)) {
      return "starPass";
    } else if (teamJam?.events.some((event) => event.lost)) {
      return "lost";
    } else if (teamJam?.events.some((event) => event.lead)) {
      return "lead";
    }
    return null;
  }, [teamJam?.events]);

  // Get the relevant Timeout information
  const { data: timeoutType } = useTimeout<"timeout" | "review" | null>({
    uuid: bout.timeoutUuids[bout.timeoutUuids.length - 1],
    enabled: bout.timeoutUuids.length > 0,
    select: (latestTimeout: Timeout) => {
      if (
        latestTimeout == null ||
        !isRunning(latestTimeout) ||
        latestTimeout.teamUuid != team.uuid
      ) {
        // Timeout only matters if it is running and was called by this Team!
        return null;
      }
      return latestTimeout.isReview ? "review" : "timeout";
    },
  });

  return {
    teamJam,
    leadIsDeclared,
    jammerInitial,
    jammerState,
    timeoutType,
  };
};
