import Clock from "@/components/clock";
import JamClock from "@/components/jam-clock";
import JamNumber from "@/components/jam-number";
import PeriodClock from "@/components/period-clock";
import { Bout } from "@/lib/game/bouts";
import { BoutContext } from "@/utils/contexts";
import { GridProps, Group, Text, TextProps } from "@mantine/core";
import { useContext } from "react";

interface PrimaryLabelProps extends TextProps {
  withClock?: boolean;
  content: string;
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

interface PrimaryBoutStatusProps
  extends Pick<GridProps, "align" | "justify">,
    Pick<TextProps, "size"> {
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
      <PrimaryStatusLabel
        withClock={hasClock && withClock}
        content={content}
        ta="center"
        {...props}
      />
    );
  }

  return (
    <Group grow justify="center" align={align}>
      <PeriodClock ta="center" {...props} />
      <JamNumber ta="center" {...props} />
      <JamClock ta="center" {...props} />
    </Group>
  );
}
