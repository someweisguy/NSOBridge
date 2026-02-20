import PlainClock from "@/components/plain-clock";
import { Bout } from "@/lib/game/bouts";
import { BoutContext } from "@/utils/contexts";
import { periodTimeStringFormatter } from "@/utils/time-string-formatters";
import { Text, TextProps } from "@mantine/core";
import { useContext } from "react";

interface BoutClockProps extends TextProps {
  overtimeText?: string;
}

export default function BoutClock({
  overtimeText = "OT",
  ...props
}: BoutClockProps) {
  const bout: Bout | null = useContext(BoutContext);
  if (bout == null) {
    throw new Error("PeriodClock must be used in a BoutProvider");
  }

  const showClock = bout.jamCounts[2] == 0;

  return (
    <Text {...props}>
      {showClock ? (
        <PlainClock {...bout.clock} formatter={periodTimeStringFormatter} />
      ) : (
        overtimeText
      )}
    </Text>
  );
}
