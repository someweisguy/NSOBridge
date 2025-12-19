import Clock from "@/components/clock";
import { useActiveJam } from "@/hooks/use-bout";
import { Bout } from "@/lib/game/bouts";
import { Text, TextProps } from "@mantine/core";

interface IntermissionStateViewProps extends TextProps {
  bout: Bout;
}

export default function IntermissionState({
  bout,
  ...props
}: IntermissionStateViewProps) {
  // TODO: remove this hook
  const jam = useActiveJam(bout);

  let copy = "Starting Soon";
  if (bout.isFinal) {
    copy = "Final Score";
  } else if (jam.period > 1) {
    copy = "Unofficial Score";
  } else if (jam.period == 1) {
    copy = "Halftime";
  }

  return (
    <Text {...props}>
      {copy}&nbsp;
      {bout.startCountdown && <Clock startTimestamp={bout.startCountdown} />}
    </Text>
  );
}
