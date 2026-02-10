import Clock from "@/components/clock";
import JamClock from "@/components/jam-clock";
import JamNumber from "@/components/jam-number";
import PeriodClock from "@/components/period-clock";
import { useSuspenseJam } from "@/hooks/use-jam";
import { useTimeout } from "@/hooks/use-timeout";
import { Bout } from "@/lib/game/bouts";
import { BoutContext } from "@/utils/contexts";
import { Center, GridProps, Group, Text, TextProps } from "@mantine/core";
import { useContext } from "react";

interface PrimaryLabelProps extends TextProps {
  withClock?: boolean;
  content: string;
}
interface SecondaryLabelProps extends TextProps {
  withClock?: boolean;
  content: string;
  countUpTimestamp?: Date | null;
}

function PrimaryStatusLabel({
  content,
  withClock,
  ...props
}: PrimaryLabelProps) {
  return (
    <Text {...props}>
      {content + (content.trim().length > 0 && withClock ? " " : "")}
      {withClock && <Clock startTimestamp={null} />} {/* TODO: fix clock */}
    </Text>
  );
}

function SecondaryStatusLabel({
  content,
  countUpTimestamp,
  withClock = false,
  ...props
}: SecondaryLabelProps) {
  return (
    <Text {...props}>
      {content + (content.trim().length > 0 && withClock ? " " : "")}
      {withClock && <Clock startTimestamp={countUpTimestamp ?? null} />}
    </Text>
  );
}

interface PrimaryBoutStatusProps
  extends Pick<GridProps, "align" | "justify">,
    Pick<TextProps, "size"> {
  withClock?: boolean;
}

interface SecondaryBoutStatusProps extends TextProps {
  withClock?: boolean;
}

export default function PrimaryBoutStatus({
  withClock = false,
  align,
  ...props
}: PrimaryBoutStatusProps) {
  const bout: Bout | null = useContext(BoutContext);
  if (bout == null) {
    throw new Error("PrimaryBoutStatus must be used within a BoutProvider");
  }

  // Render the Bout status in a single column if the Bout is stopped
  if (bout.state == "stopped") {
    let content: string;
    let hasClock: boolean;
    if (bout.isFinal) {
      content = "Final";
      hasClock = false;
    } else if (bout.jamCounts[2] > 0) {
      content = "Unofficial";
      hasClock = false;
    } else if (bout.jamCounts[1] > 0) {
      content = "Halftime";
      hasClock = bout.startCountdown != null;
    } else {
      content = "Pregame";
      hasClock = bout.startCountdown != null;
    }
    return (
      <Group justify="center" align={align}>
        <PrimaryStatusLabel
          withClock={hasClock && withClock}
          content={content}
          {...props}
        />
      </Group>
    );
  }

  return (
    <Group grow justify="center" align={align}>
      <Center>
        <PeriodClock {...props} />
      </Center>
      <Center>
        <JamNumber {...props} />
      </Center>
      <Center>
        <JamClock {...props} />
      </Center>
    </Group>
  );
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

  return (
    <SecondaryStatusLabel
      withClock={withClock}
      content={content}
      countUpTimestamp={countUpTimestamp}
      {...props}
    />
  );
}
