import Clock from "@/components/clock";
import { Bout } from "@/lib/game/bouts";
import { Jam } from "@/lib/game/jams";
import { Timeout } from "@/lib/game/timeouts";
import { Text, TextProps } from "@mantine/core";

interface ExtraordinaryStateClockProps extends TextProps {
  bout: Bout;
  activeJam: Jam;
  latestTimeout: Timeout | null;
}

export default function ExtraordinaryStateClock({
  bout,
  activeJam,
  latestTimeout,
  ...props
}: ExtraordinaryStateClockProps) {
  // Render non-Jam Bout states
  let gameStopTimestamp: Date | null = null;
  let gameState = "";
  if (bout.state === "lineup" && activeJam.stopTimestamp != null) {
    if (
      latestTimeout?.stopTimestamp != null &&
      latestTimeout.stopTimestamp > activeJam.stopTimestamp
    ) {
      // Handle post-timeout lineup condition
      gameState = "Post-Timeout";
      gameStopTimestamp = latestTimeout.stopTimestamp;
    } else {
      // Handle standard lineup condition
      gameState = "Lineup";
      gameStopTimestamp = activeJam.stopTimestamp;
    }
  } else if (bout.state === "timeout") {
    if (latestTimeout?.teamIsOfficials) {
      gameState = "Official Timeout";
    } else if (latestTimeout?.isReview) {
      gameState = "Official Review";
    } else if (latestTimeout?.teamNum != null) {
      gameState = "Team Timeout";
    } else {
      gameState = "Timeout";
    }
    gameStopTimestamp = latestTimeout!.startTimestamp;
  }

  return (
    <Text {...props}>
      {gameState}&nbsp;
      {gameStopTimestamp && <Clock startTimestamp={gameStopTimestamp} />}
    </Text>
  );
}
