import { BoutStateString } from "@/types/bout";
import { StopReasonString } from "@/types/jam";
import { Clock } from "@/types/time";
import { Card, Collapse, Grid, Group, Text } from "@mantine/core";
import ClockView from "./clock-view";

const stopReasonTexts: Record<StopReasonString, string> = {
  called: "Called",
  elapsed: "Time",
  injury: "Injury",
  other: "-",
};

const stateTexts: Record<BoutStateString, string> = {
  final: "Final",
  jam: "Jam",
  lineup: "Lineup",
  timeout: "Timeout",
  stopped: "Stopped",
};

interface BoutStateProps {
  clock: Clock;
  state: BoutStateString;
  isOvertime: boolean;
  activePeriodNum: number;
  activeJamNum: number;
  eventTimestamp: string | null;
  stopReason: StopReasonString | null;
  jamDuration: number;
}

export default function BoutState({
  clock,
  state,
  isOvertime,
  activePeriodNum,
  activeJamNum,
  eventTimestamp,
  stopReason,
  jamDuration,
}: BoutStateProps) {
  return (
    <Group gap="xl" fz="24pt" ta="center" justify="center" align="center">
      <Card withBorder w="content" bg="gray.0">
        <Grid justify="space-between" align="center" gap="sm">
          <Grid.Col span={4}>
            <Text inherit>
              {isOvertime ? (
                "OT"
              ) : (
                <ClockView inherit {...clock} formatter="bout" />
              )}
            </Text>
          </Grid.Col>
          <Grid.Col span={4}>
            <Group justify="space-between">
              <Text inherit w="300">
                P{activePeriodNum + 1} J{activeJamNum + 1}
              </Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={4}>
            <Text inherit>
              {state != "jam" && state != "stopped" ? (
                stopReasonTexts[stopReason ?? "other"]
              ) : (
                <ClockView
                  inherit
                  alarm={jamDuration}
                  startTimestamp={eventTimestamp}
                />
              )}
            </Text>
          </Grid.Col>
        </Grid>
      </Card>
      <Collapse keepMounted orientation="horizontal" expanded={state != "jam"}>
        <Card withBorder w="250" bg="yellow.3">
          <Group justify="center" wrap="nowrap">
            {stateTexts[state]}
            {eventTimestamp != null && state != "jam" && (
              <ClockView startTimestamp={eventTimestamp} inherit />
            )}
          </Group>
        </Card>
      </Collapse>
    </Group>
  );
}
