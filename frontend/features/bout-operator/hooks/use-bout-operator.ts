import { useBout } from "@/hooks/use-bout";
import { useJam } from "@/hooks/use-jam";
import { useTimeout } from "@/hooks/use-timeout";
import { Bout, Team } from "@/types/bout";
import { ComboboxData } from "@mantine/core";
import { useMemo } from "react";

// TODO: docs
export const useBoutOperator = ({
  uuid,
  jamUuids,
  state,
  activeJamUuid,
  timeoutUuids,
}: Bout) => {
  const { data: activeJam } = useJam({ uuid: activeJamUuid });
  const { data: latestTimeout } = useTimeout({
    uuid: timeoutUuids[timeoutUuids.length - 1],
    enabled: timeoutUuids.length > 0,
  });

  const { data: teams } = useBout<ComboboxData<string>>({
    uuid,
    select: (bout: Bout) =>
      bout.teams.map((team: Team) => ({
        value: team.uuid,
        label: team.name,
      })),
  });

  const periodNum = activeJam != null ? Math.min(activeJam.period, 1) : null;
  let jamNum = activeJam?.num ?? null;
  if (jamNum != null && activeJam!.period > 1) {
    jamNum += jamUuids[1].length;
  }

  // Get the time since the last Jam or Timeout or null if neither have occurred
  const lastEventTimestamp: string | null = useMemo(
    () =>
      activeJam?.startTimestamp != null
        ? new Date(
            Math.max(
              ...[
                activeJam?.startTimestamp,
                activeJam?.stopTimestamp,
                latestTimeout?.startTimestamp,
                latestTimeout?.stopTimestamp,
              ]
                .filter((val?: string | null) => val != null)
                .map((val: string) => new Date(val).getTime()),
            ),
          ).toISOString()
        : null,
    [activeJam, latestTimeout],
  );

  const showJamStopReasonEditor = activeJam?.stopTimestamp != null;
  const showTimeoutEditor = state == "timeout" && latestTimeout != null;

  return {
    teams,
    activeJam,
    periodNum,
    jamNum,
    latestTimeout,
    lastEventTimestamp,
    showJamStopReasonEditor,
    showTimeoutEditor,
  };
};
