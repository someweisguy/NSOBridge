import { useSuspenseJam } from "@/hooks/use-suspense-jam";
import { useTimeout } from "@/hooks/use-timeout";
import { Bout } from "@/lib/game/bouts";
import { TextProps } from "@mantine/core";
import { BoutSecondaryStatus } from "./bout-secondary-status";

interface BoutSecondaryStatusContainerProps extends TextProps {
  bout: Bout; // TODO: remove Bout from props
  serverOffset?: number;
}

export default function BoutSecondaryStatusContainer({
  bout,
  ...props
}: BoutSecondaryStatusContainerProps) {
  const { data: activeJam } = useSuspenseJam(
    bout.uuid,
    ...bout.getActiveOrLatestJamNum(),
  );
  const { data: latestTimeout, isPending } = useTimeout(
    bout.uuid,
    bout.timeoutCount - 1,
    {
      enabled: bout.timeoutCount > 0,
      initialData: undefined,
    },
  );

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
    <BoutSecondaryStatus
      stateText={content}
      since={countUpTimestamp}
      {...props}
    />
  );
}
