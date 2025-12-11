import Clock from "@/components/clock";
import useActiveJam from "@/hooks/use-active-jam";
import useTimeout from "@/hooks/use-timeout";
import { Bout } from "@/types/game";
import { Text, TextProps } from "@mantine/core";

interface ExtraordinaryStateClockProps extends TextProps {
  bout: Bout;
}

export default function ExtraordinaryStateClock({
  bout,
  ...props
}: ExtraordinaryStateClockProps) {
  const activeJam = useActiveJam(bout.id);
  const latestTimeout = useTimeout(bout.id, bout.numTimeouts - 1);

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
    } else if (latestTimeout?.teamId != null) {
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
