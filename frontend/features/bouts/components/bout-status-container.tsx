import { StatusClock } from "@/components/status-clock";
import { useSuspenseBout } from "@/hooks/use-suspense-bout";
import { useSuspenseJam } from "@/hooks/use-suspense-jam";
import { useTimeout } from "@/hooks/use-timeout";
import { BoutUri } from "@/types/query";
import { TextProps } from "@mantine/core";

/**
 * Displays the Bout status of the desired Bout. This is typically a status string
 * followed by the time that has elapsed since this status has begun or a countdown
 * until the status will end. For example, this component displays the time since a
 * Timeout was called or the time until Halftime is finished.
 */
export default function StatusClockContainer({
  boutUuid,
  ...props
}: BoutUri & TextProps) {
  const { data: bout } = useSuspenseBout({ boutUuid });

  const { data: activeJam } = useSuspenseJam({
    ...(bout.getActiveJamUri() ?? bout.getLatestJamUri()),
  });
  const { data: latestTimeout, isPending } = useTimeout({
    ...bout.getLatestTimeoutUri(),
    enabled: bout.timeoutCount > 0,
    initialData: undefined,
  });

  let content: string;
  let countUpTimestamp: Date | null;
  if (bout.state == "stopped") {
    if (bout.isFinal) {
      content = "Final";
      countUpTimestamp = null;
    } else if (bout.jamCounts[2] > 0) {
      content = "Unofficial";
      countUpTimestamp = null;
    } else if (bout.jamCounts[1] > 0) {
      content = "Halftime";
      countUpTimestamp = bout.startCountdown;
    } else {
      content = "Pregame";
      countUpTimestamp = bout.startCountdown;
    }
  } else if (bout.state == "final") {
    content = "Final";
    countUpTimestamp = null;
  } else if (bout.state == "jam") {
    content = "Jam";
    countUpTimestamp = null;
  } else if (bout.state == "lineup") {
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
