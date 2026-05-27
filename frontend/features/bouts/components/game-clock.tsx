import { BoutStateString } from "@/types/bout";
import { StopReasonString } from "@/types/jam";
import { Clock } from "@/types/time";
import { Box, SimpleGrid, SimpleGridProps, Text } from "@mantine/core";
import ClockView from "../../../components/clock-view";

const stopReasonTexts: Record<StopReasonString, string> = {
  called: "Called",
  elapsed: "Time",
  injury: "Injury",
  other: "-",
};

// const stateTexts: Record<BoutStateString, string> = {
//   final: "Final",
//   jam: "Jam",
//   lineup: "Lineup",
//   timeout: "Timeout",
//   stopped: "Stopped",
// };

interface BoutClockProps extends SimpleGridProps {
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
  ...props
}: BoutClockProps) {
  return (
    <SimpleGrid cols={3} ta={ta} {...props}>
      <Box px="md">
        {isOvertime ? (
          <Text inherit>OT</Text>
        ) : (
          <ClockView inherit {...clock} />
        )}
      </Box>
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
    </SimpleGrid>
  );
}
