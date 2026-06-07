import { BoutStateString } from "@/types/bout";
import { StopReasonString } from "@/types/jam";
import { Clock } from "@/types/time";
import { Grid, GridProps, Text } from "@mantine/core";
import ClockView from "../../../components/clock-view";

const stopReasonTexts: Record<StopReasonString, string> = {
  called: "Called",
  elapsed: "Time",
  injury: "Injury",
  other: "-",
};

interface BoutClockProps extends Omit<GridProps, "columns"> {
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
  align = "center",
  ...props
}: BoutClockProps) {
  return (
    <Grid columns={3} ta={ta} justify={justify} align={align} {...props}>
      <Grid.Col span={1}>
        {isOvertime ? (
          <Text inherit>OT</Text>
        ) : (
          <ClockView inherit formatter="bout" {...clock} />
        )}
      </Grid.Col>
      <Grid.Col span={1} miw="fit-content">
        <Text inherit>
          P{activePeriodNum + 1} J{activeJamNum + 1}
        </Text>
      </Grid.Col>
      <Grid.Col span={1}>
        {state != "jam" && stopReason != null ? (
          <Text inherit>{stopReasonTexts[stopReason ?? "other"]}</Text>
        ) : (
          <ClockView
            inherit
            formatter="jam"
            alarm={jamDuration}
            startTimestamp={state == "jam" ? startTimestamp : null}
          />
        )}
      </Grid.Col>
    </Grid>
  );
}
