import Clock from "@/components/clock";
import { Bout } from "@/lib/game/bouts";
import { Jam } from "@/lib/game/jams";
import { Text, TextProps } from "@mantine/core";

interface IntermissionStateViewProps extends TextProps {
  bout: Bout;
  activeJam: Jam;
}

export default function IntermissionState({
  bout,
  activeJam,
  ...props
}: IntermissionStateViewProps) {
  let copy = "Starting Soon";
  if (bout.isFinal) {
    copy = "Final Score";
  } else if (activeJam.period > 1) {
    copy = "Unofficial Score";
  } else if (activeJam.period == 1) {
    copy = "Halftime";
  }

  return (
    <Text {...props}>
      {copy}&nbsp;
      {bout.startCountdown && <Clock startTimestamp={bout.startCountdown} />}
    </Text>
  );
}
