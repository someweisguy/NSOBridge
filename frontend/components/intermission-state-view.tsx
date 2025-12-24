import Clock from "@/components/clock";
import { Bout } from "@/lib/game/bouts";
import { Text, TextProps } from "@mantine/core";

interface IntermissionStateViewProps extends TextProps {
  bout: Bout;
}

export default function IntermissionState({
  bout,
  ...props
}: IntermissionStateViewProps) {
  const [periodNum] = bout.getActiveOrLatestJamIndex();

  let copy = "Starting Soon";
  if (bout.isFinal) {
    copy = "Final Score";
  } else if (periodNum > 1) {
    copy = "Unofficial Score";
  } else if (periodNum == 1) {
    copy = "Halftime";
  }

  return (
    <Text {...props}>
      {copy}&nbsp;
      {bout.startCountdown && <Clock startTimestamp={bout.startCountdown} />}
    </Text>
  );
}
