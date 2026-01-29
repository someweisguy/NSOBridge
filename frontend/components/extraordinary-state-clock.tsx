import Clock from "@/components/clock";
import { Bout } from "@/lib/game/bouts";
import { Jam } from "@/lib/game/jams";
import { Timeout } from "@/lib/game/timeouts";
import { Text, TextProps } from "@mantine/core";

interface ExtraordinaryStateClockProps extends TextProps {
  bout: Bout;
  activeJam: Jam;
  activeTimeout: Timeout | null;
}

export default function ExtraordinaryStateClock({
  bout,
  activeJam,
  activeTimeout,
  ...props
}: ExtraordinaryStateClockProps) {
  // Render non-Jam Bout states
  let gameStopTimestamp: Date | null = null;
  let gameState = "";
  if (bout.state === "lineup" && activeJam.stopTimestamp != null) {
    if (
      activeTimeout?.stopTimestamp != null &&
      activeTimeout.stopTimestamp > activeJam.stopTimestamp
    ) {
      // Handle post-timeout lineup condition
      gameState = "Post-Timeout";
      gameStopTimestamp = activeTimeout.stopTimestamp;
    } else {
      // Handle standard lineup condition
      gameState = "Lineup";
      gameStopTimestamp = activeJam.stopTimestamp;
    }
  } else if (bout.state === "timeout") {
    if (activeTimeout?.teamIsOfficials) {
      gameState = "Official Timeout";
    } else if (activeTimeout?.isReview) {
      gameState = "Official Review";
    } else if (activeTimeout?.teamNum != null) {
      gameState = "Team Timeout";
    } else {
      gameState = "Timeout";
    }
    gameStopTimestamp = activeTimeout!.startTimestamp;
  }

  return (
    <Text {...props}>
      {gameState}&nbsp;
      {gameStopTimestamp && <Clock startTimestamp={gameStopTimestamp} />}
    </Text>
  );
}
