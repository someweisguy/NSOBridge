import Clock from "@/components/clock";
import { useSuspenseJam } from "@/hooks/use-jam";
import { useTimeout } from "@/hooks/use-timeout";
import { Bout } from "@/lib/game/bouts";
import { BoutContext } from "@/utils/contexts";
import { Text, TextProps } from "@mantine/core";
import { useContext } from "react";

interface SecondaryBoutStatusProps extends TextProps {
  withClock?: boolean;
}

export function SecondaryBoutStatus({
  withClock = false,
  ...props
}: SecondaryBoutStatusProps) {
  const bout: Bout | null = useContext(BoutContext);
  if (bout == null) {
    throw new Error("SecondaryBoutStatus must be used within a BoutProvider");
  }
  const [currentPeriodNum, currentJamNum] = bout.getActiveOrLatestJamNum();
  const { data: activeJam } = useSuspenseJam(
    bout,
    currentPeriodNum,
    currentJamNum,
  );
  const { data: latestTimeout, isPending } = useTimeout(
    bout,
    bout.timeoutCount - 1,
    {
      enabled: bout.timeoutCount > 0,
      initialData: undefined,
    },
  );

  if (bout.state != "lineup" && bout.state != "timeout") {
    return <></>;
  }

  let content: string;
  let countUpTimestamp: Date | null;
  if (bout.state == "lineup") {
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

  // Don't show the clock if there is no timestamp from which to count up
  if (!countUpTimestamp) {
    withClock = false;
  }

  return (
    <Text {...props}>
      {content + (content.trim().length > 0 && withClock ? " " : "")}
      {withClock && <Clock startTimestamp={countUpTimestamp ?? null} />}
    </Text>
  );
}
