import { useSuspenseBout } from "@/hooks/use-bout";
import { useSuspenseJam } from "@/hooks/use-jam";
import { useTimeout } from "@/hooks/use-timeout";
import { Team } from "@/types/bout";
import { Jam, TeamJam } from "@/types/jam";
import { Timeout } from "@/types/timeout";
import { isRunning } from "@/utils/time";

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

  const jammerLead = teamJam?.events.some((event) => event.lead) ?? false;
  const jammerLost = teamJam?.events.some((event) => event.lost) ?? false;
  const jammerStarPass =
    teamJam?.events.some((event) => event.starPass) ?? false;

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

  const { data: jamHasStarted } = useSuspenseJam({
    uuid: bout.activeJamUuid,
    select: (activeJam: Jam) => activeJam.startTimestamp != null,
  });

  return {
    teamJam,
    teamIsInThisJam: teamJam != null,
    leadIsDeclared,
    jammerLead,
    jammerLost,
    jammerStarPass,
    jammerInitial,
    timeoutType: timeoutType ?? null,
    jamHasStarted,
  };
};
