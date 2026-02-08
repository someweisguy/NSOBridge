import { Bout } from "@/lib/game/bouts";
import { BoutContext } from "@/utils/contexts";
import { Text, TextProps } from "@mantine/core";
import { useContext } from "react";

interface JamNumberProps extends TextProps {
  periodNum?: number;
  jamNum?: number;
}

export default function JamNumber({
  periodNum,
  jamNum,
  ...props
}: JamNumberProps) {
  const bout: Bout | null = useContext(BoutContext);
  if (bout == null) {
    throw new Error("JamNumber must be used in a BoutProvider");
  }

  const [activePeriodNum, activeJamNum] = bout.getActiveOrLatestJamNum();
  periodNum ??= activePeriodNum;
  jamNum ??= activeJamNum;

  return (
    <Text {...props}>
      P{periodNum + 1} J{jamNum + 1}
    </Text>
  );
}
