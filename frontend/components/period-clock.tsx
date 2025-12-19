import Clock from "@/components/clock";
import { Bout } from "@/lib/game/bouts";
import { periodTimeStringFormatter } from "@/utils/time-string-formatters";
import { Text, TextProps } from "@mantine/core";

interface PeriodClockProps extends TextProps {
  bout: Bout;
}

export default function PeriodClock({ bout, ...props }: PeriodClockProps) {
  const showClock = bout.jamIds[2].length == 0;

  const overtimeText = "OT";

  return (
    <Text {...props}>
      {showClock ? (
        <Clock {...bout.clock} formatter={periodTimeStringFormatter} />
      ) : (
        overtimeText
      )}
    </Text>
  );
}
