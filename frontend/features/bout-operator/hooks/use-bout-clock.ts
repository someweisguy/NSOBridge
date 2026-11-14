import { useJam } from "@/hooks/use-jam";
import { useRuleset } from "@/hooks/use-ruleset";
import { useTimeout } from "@/hooks/use-timeout";
import { Bout } from "@/types/bout";
import { useMemo } from "react";
import { BoutEvent } from "../components/bout-clock";

// TODO: docs
export const useBoutClock = (bout?: Bout) => {
  const { data: activeJam } = useJam({
    uuid: bout?.activeJamUuid ?? "",
    enabled: bout != null,
  });
  const { data: latestTimeout } = useTimeout({
    uuid: bout?.timeoutUuids[(bout?.timeoutUuids.length ?? 1) - 1] ?? "",
    enabled: bout != null && bout.timeoutUuids.length > 0,
  });
  const { data: ruleset } = useRuleset({
    uuid: bout?.uuid ?? "",
    enabled: bout != null,
  });

  const periodNum = activeJam != null ? Math.min(activeJam.period, 1) : null;
  let jamNum = activeJam?.num ?? null;
  if (jamNum != null && activeJam!.period > 1) {
    jamNum += bout?.jamUuids[1].length ?? 0; // TODO: magic number
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

  const isInOvertime = bout?.jamUuids[2].includes(bout?.activeJamUuid) ?? false; // TODO: magic number
  const jamStartTimestamp = bout?.state == "jam" ? lastEventTimestamp : null;
  const showJamClock = activeJam?.stopTimestamp == null;

  const boutEvent: BoutEvent | null = useMemo(() => {
    const jamPeriod = activeJam?.period ?? NaN;
    const jamNum = activeJam?.num ?? NaN;
    const timeoutPeriod = latestTimeout?.periodNum ?? NaN;
    const timeoutJamNum = latestTimeout?.jamNum ?? NaN;
    const numPeriods = ruleset?.numPeriods ?? NaN;
    switch (bout?.state) {
      case "stopped":
        if (jamPeriod >= numPeriods) {
          return "unofficial";
        } else if (jamPeriod > 0) {
          return "halftime";
        } else {
          return "pregame";
        }
      case "lineup":
        if (timeoutPeriod == jamPeriod && timeoutJamNum == jamNum) {
          return latestTimeout?.isReview ? "post_review" : "post_timeout";
        }
        return bout.state;
      case "timeout":
        if (latestTimeout?.isReview) {
          return "review";
        } else if (latestTimeout?.teamIsOfficials) {
          return "official_timeout";
        } else if (latestTimeout?.teamUuid != null) {
          return "team_timeout";
        }
        return bout.state;
      default:
        return bout?.state ?? null;
    }
  }, [bout, activeJam, latestTimeout, ruleset]);

  return {
    activeJam,
    isInOvertime,
    periodNum,
    jamNum,
    jamStartTimestamp,
    lastEventTimestamp,
    showJamClock,
    boutEvent,
  };
};
