import Clock from "@/components/clock";
import { useJam } from "@/hooks/use-jam";
import { Bout } from "@/lib/game/bouts";
import { Ruleset } from "@/lib/game/ruleset";
import { BoutContext, RulesetContext } from "@/utils/contexts";
import { jamTimeStringFormatter } from "@/utils/time-string-formatters";
import { Text, TextProps } from "@mantine/core";
import { useContext } from "react";

interface JamClockProps extends TextProps {
  periodNum?: number;
  jamNum?: number;
}

export default function JamClock({
  periodNum,
  jamNum,
  ...props
}: JamClockProps) {
  const bout: Bout | null = useContext(BoutContext);
  const ruleset: Ruleset | null = useContext(RulesetContext);
  if (bout == null || ruleset == null) {
    throw new Error("JamClock must only be used in a BoutProvider");
  }

  const [activePeriodNum, activeJamNum] = bout.getActiveOrLatestJamNum();
  periodNum ??= activePeriodNum;
  jamNum ??= activeJamNum;

  const { data: jam } = useJam(bout, periodNum, jamNum);

  return (
    <Text {...props}>
      <Clock
        startTimestamp={jam?.startTimestamp ?? null}
        alarm={ruleset.jamDuration}
        formatter={jamTimeStringFormatter}
      />
    </Text>
  );
}
