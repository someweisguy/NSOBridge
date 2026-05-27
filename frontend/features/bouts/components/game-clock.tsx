import { BoutStateString } from "@/types/bout";
import { StopReasonString } from "@/types/jam";
import { Clock } from "@/types/time";
import { Group, GroupProps, Text } from "@mantine/core";
import ClockView from "../../../components/clock-view";

const stopReasonTexts: Record<StopReasonString, string> = {
  called: "Called",
  elapsed: "Time",
  injury: "Injury",
  other: "-",
};

interface BoutClockProps extends GroupProps {
  clock: Clock;
  state: BoutStateString;
  isOvertime: boolean;
  activePeriodNum: number;
  activeJamNum: number;
  startTimestamp: string | null;
  stopReason: StopReasonString | null;
  jamDuration: number;
}

export default function GameClock({
  clock,
  state,
  isOvertime,
  activePeriodNum,
  activeJamNum,
  startTimestamp,
  stopReason,
  jamDuration,
  ta = "center",
  justify = "space-between",
  ...props
}: BoutClockProps) {
  return (
    <Group ta={ta} justify={justify} {...props}>
      {isOvertime ? (
        <Text inherit ta="right">
          OT
        </Text>
      ) : (
        <ClockView inherit ta="right" {...clock} />
      )}
      <Text inherit>
        P{activePeriodNum + 1} J{activeJamNum + 1}
      </Text>
      {state != "jam" && state != "stopped" ? (
        <Text inherit>{stopReasonTexts[stopReason ?? "other"]}</Text>
      ) : (
        <ClockView
          inherit
          alarm={jamDuration}
          startTimestamp={state == "jam" ? startTimestamp : null}
        />
      )}
    </Group>
  );
}
