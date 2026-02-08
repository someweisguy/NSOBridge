import Clock from "@/components/clock";
import { Bout } from "@/lib/game/bouts";
import { BoutContext } from "@/utils/contexts";
import { periodTimeStringFormatter } from "@/utils/time-string-formatters";
import { Text, TextProps } from "@mantine/core";
import { useContext } from "react";

export default function PeriodClock({ ...props }: TextProps) {
  const bout: Bout | null = useContext(BoutContext);
  if (bout == null) {
    throw new Error("PeriodClock must be used in a BoutProvider");
  }

  const showClock = bout.jamCounts[2] == 0;
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
