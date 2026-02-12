import Clock from "@/components/clock";
import { Bout } from "@/lib/game/bouts";
import { BoutContext } from "@/utils/contexts";
import { Text, TextProps } from "@mantine/core";
import { useContext } from "react";

interface IntermissionLabel extends TextProps {
  withClock?: boolean;
}

export default function IntermissionLabel({
  withClock = false,
  ...props
}: IntermissionLabel) {
  const bout: Bout | null = useContext(BoutContext);
  if (bout == null) {
    throw new Error("PrimaryBoutStatus must be used within a BoutProvider");
  }

  if (bout.state != "stopped") {
    return <></>;
  }

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

  withClock = hasClock && withClock;

  return (
    <Text {...props}>
      {content + (content.trim().length > 0 && withClock ? " " : "")}
      {withClock && <Clock startTimestamp={null} />} {/* TODO: fix clock */}
    </Text>
  );
}
