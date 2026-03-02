import { useSuspenseJam } from "@/hooks/use-suspense-jam";
import { useTimeout } from "@/hooks/use-timeout";
import { BoutStateString } from "@/lib/game/bouts";
import { TextProps } from "@mantine/core";
import { StatusClock } from "../../../components/status-clock";

interface BoutStatusContainerProps extends TextProps {
  /**
   * The UUID of the desired Bout.
   */
  uuid: string;
  /**
   * The state of the desired Bout.
   */
  state: BoutStateString;
  /**
   * The timestamp of when the Bout will begin, if it is set.
   */
  startCountdown: Date | null;
  /**
   * The number of Jams in each Period.
   */
  jamCounts: [number, number, number];
  /**
   * True if the Bout is final.
   */
  isFinal: boolean;
  /**
   * The number of Timeouts in the Bout.
   */
  timeoutCount: number;
  /**
   * The offset in time between the host and the server in milliseconds.
   */
  serverOffset?: number;
}

export default function BoutStatusContainer({
  uuid,
  state,
  startCountdown,
  jamCounts,
  isFinal,
  timeoutCount,
  ...props
}: BoutStatusContainerProps) {
  // Get the latest Period number that contains Jams
  let periodNum = 0;
  for (let i = jamCounts.length - 1; i >= 0; --i) {
    if (jamCounts[i] > 0) {
      periodNum = i;
      break;
    }
  }

  // Get the latest Jam number in the active Period
  const jamNum =
    jamCounts[periodNum] - (state == "lineup" || state == "stopped" ? 1 : 2);

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
    <StatusClock
      stateText={content}
      startTimestamp={countUpTimestamp}
      {...props}
    />
  );
}
