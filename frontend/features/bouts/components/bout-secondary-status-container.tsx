import { useSuspenseJam } from "@/hooks/use-suspense-jam";
import { useTimeout } from "@/hooks/use-timeout";
import { BoutStateString } from "@/lib/game/bouts";
import { TextProps } from "@mantine/core";
import { BoutSecondaryStatus } from "./bout-secondary-status";

interface BoutSecondaryStatusContainerProps extends TextProps {
  uuid: string;
  state: BoutStateString;
  startCountdown: Date | null;
  jamCounts: [number, number, number];
  isFinal: boolean;
  timeoutCount: number;
  serverOffset?: number;
}

export default function BoutSecondaryStatusContainer({
  uuid,
  state,
  startCountdown,
  jamCounts,
  isFinal,
  timeoutCount,
  ...props
}: BoutSecondaryStatusContainerProps) {
  // Get the latest Period number that contains Jams
  let periodNum = 0;
  for (let i = jamCounts.length - 1; i >= 0; --i) {
    if (jamCounts[i] > 0) {
      periodNum = i;
      break;
    }
  }

  // Get the latest Jam number in the active Period
  const jamNum = jamCounts[periodNum] - 1;

  const { data: activeJam } = useSuspenseJam(uuid, periodNum, jamNum);
  const { data: latestTimeout, isPending } = useTimeout(
    uuid,
    timeoutCount - 1,
    {
      enabled: timeoutCount > 0,
      initialData: undefined,
    },
  );

  let content: string;
  let countUpTimestamp: Date | null;
  if (state == "stopped") {
    if (isFinal) {
      content = "Final";
      countUpTimestamp = null;
    } else if (jamCounts[2] > 0) {
      content = "Unofficial";
      countUpTimestamp = null;
    } else if (jamCounts[1] > 0) {
      content = "Halftime";
      countUpTimestamp = startCountdown;
    } else {
      content = "Pregame";
      countUpTimestamp = startCountdown;
    }
  } else if (state == "final") {
    content = "Final";
    countUpTimestamp = null;
  } else if (state == "jam") {
    content = "Jam";
    countUpTimestamp = null;
  } else if (state == "lineup") {
    if (
      activeJam.stopTimestamp &&
      latestTimeout?.startTimestamp &&
      latestTimeout?.startTimestamp > activeJam.stopTimestamp
    ) {
      content = latestTimeout.isReview ? "Post-review" : "Post-timeout";
      countUpTimestamp = latestTimeout.stopTimestamp;
    } else {
      content = "Lineup";
      countUpTimestamp = activeJam.stopTimestamp;
    }
  } else {
    // Bout state is Timeout
    countUpTimestamp = latestTimeout?.startTimestamp ?? null;
    if (latestTimeout?.isReview) {
      content = "Official Review";
    } else {
      if (
        isPending ||
        (!latestTimeout?.teamIsOfficials && latestTimeout?.teamNum == null)
      ) {
        content = "Timeout";
      } else if (latestTimeout?.teamIsOfficials) {
        content = "Official Timeout";
      } else {
        content = "Team Timeout";
      }
    }
  }

  return (
    <BoutSecondaryStatus
      stateText={content}
      since={countUpTimestamp}
      {...props}
    />
  );
}
