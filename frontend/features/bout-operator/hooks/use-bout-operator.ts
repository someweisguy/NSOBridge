import useSuspenseActiveJam from "@/hooks/use-active-jam";
import { useBout } from "@/hooks/use-bout";
import useLatestTimeout from "@/hooks/use-latest-timeout";
import { Bout, Team } from "@/types/bout";
import { ComboboxData } from "@mantine/core";
import { useMemo } from "react";

// TODO: docs
export const useBoutOperator = (bout: Bout) => {
  const { data: activeJam } = useSuspenseActiveJam(bout);
  const { data: latestTimeout } = useLatestTimeout(bout);
  const { data: teams } = useBout<ComboboxData<string>>({
    uuid: bout.uuid,
    select: (bout: Bout) =>
      bout.teams.map((team: Team) => ({
        value: team.uuid,
        label: team.name,
      })),
  });

  const periodNum = Math.min(activeJam.period, 1);
  let jamNum = activeJam.num;
  if (activeJam.period > 1) {
    jamNum += bout.jamUuids[1].length;
  }

  // Get the time since the last Jam or Timeout or null if neither have occurred
  const lastEventTimestamp: string | null = useMemo(
    () =>
      activeJam.startTimestamp != null
        ? new Date(
            Math.max(
              ...[
                activeJam.startTimestamp,
                activeJam.stopTimestamp,
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

  const showJamStopReasonEditor = activeJam.stopTimestamp != null;
  const showTimeoutEditor = bout.state == "timeout" && latestTimeout != null;

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
