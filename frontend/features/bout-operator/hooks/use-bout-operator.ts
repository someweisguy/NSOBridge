import { useBout } from "@/hooks/use-bout";
import { useJam } from "@/hooks/use-jam";
import { useTimeout } from "@/hooks/use-timeout";
import { Bout, Team } from "@/types/bout";
import { ComboboxData } from "@mantine/core";

// TODO: docs
export const useBoutOperator = ({
  uuid,
  jamUuids,
  state,
  subState,
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

  let jamNum = activeJam?.num ?? null;
  if (jamNum != null && activeJam!.period > 1) {
    jamNum += jamUuids[1].length;
  }

  const showJamStopReasonEditor = activeJam?.stopTimestamp != null;
  const showTimeoutEditor = state == "timeout" && latestTimeout != null;
  const canFinalizeBout = subState == "unofficial";
  const canStopPeriod =
    state == "lineup" &&
    (activeJam?.num != 0 || activeJam?.stopTimestamp != null);
  // TODO: disable the end period button if there is more than 30 seconds remaining

  return {
    teams,
    activeJam,
    latestTimeout,
    showJamStopReasonEditor,
    showTimeoutEditor,
    canFinalizeBout,
    canStopPeriod,
  };
};
