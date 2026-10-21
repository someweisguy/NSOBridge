import ClockView from "@/components/clock-view";
import { BoutStateString, BoutSubStateString } from "@/types/bout";
import { StopReasonString } from "@/types/jam";
import { Clock } from "@/types/time";
import {
  Collapse,
  Divider,
  Grid,
  Group,
  Loader,
  Stack,
  StackProps,
  Text,
} from "@mantine/core";

const eventNames: Record<BoutSubStateString, string> = {
  pregame: "Pregame",
  halftime: "Halftime",
  unofficial: "Unofficial",
  lineup: "Lineup",
  post_review: "Post-review",
  post_timeout: "Post-timeout",
  jam: "Jam",
  timeout: "Timeout",
  review: "Official Review",
  team_timeout: "Team Timeout",
  official_timeout: "Official Timeout",
  final: "Final",
};

const stopReasons: Record<StopReasonString, string> = {
  called: "Call",
  elapsed: "Time",
  injury: "Inj.",
  other: "-",
};

export interface BoutClockProps extends StackProps {
  boutClock: Clock;
  boutState: BoutStateString;
  boutSubState: BoutSubStateString;
  periodNum: number | null;
  jamNum: number | null;
  jamStopReason: StopReasonString | null | undefined;
  lastEventTimestamp: string | null;
  jamDuration: number | undefined;
}

/**
 * Render the time information relevant to the Bout.
 */
export default function BoutClock({
  boutClock,
  boutState,
  boutSubState,
  periodNum,
  jamNum,
  jamStopReason,
  lastEventTimestamp,
  jamDuration,
  ...props
}: BoutClockProps) {
  const hasLoaded =
    periodNum != null &&
    jamNum != null &&
    jamStopReason !== undefined &&
    jamDuration !== undefined;

  return (
    <Stack justify="center" align="stretch" gap="0" {...props}>
      {hasLoaded ? (
        <Grid
          justify="space-between"
          align="center"
          p="xs"
          ta="center"
          fz="1.5rem"
          rowGap="0"
        >
          <Grid.Col span={4}>
            {/* TODO: Overtime display */}
            <ClockView formatter="bout" fz="1.5rem" {...boutClock} />
          </Grid.Col>
          <Grid.Col span={4}>
            <Text textWrap="nowrap" fz="1.5rem">
              P{periodNum + 1} J{jamNum + 1}
            </Text>
          </Grid.Col>
          <Grid.Col span={4}>
            {boutState == "jam" ? (
              <ClockView
                startTimestamp={lastEventTimestamp}
                alarm={jamDuration}
                formatter="jam"
                fz="1.5rem"
              />
            ) : (
              <Text fw={200} tt="uppercase">
                {stopReasons[jamStopReason ?? "other"]}
              </Text>
            )}
          </Grid.Col>
        </Grid>
      ) : (
        <Loader type="dots" size="xs" />
      )}

      <Collapse expanded={boutState != "jam"} w="100%">
        <Stack justify="start" align="stretch" gap="0">
          <Divider mx="md" />
          <Group
            justify="center"
            align="center"
            p="xs"
            // TODO: set background color according to Bout State
          >
            <Text ta="center">{eventNames[boutSubState] ?? "-"}</Text>
            {/* TODO: conditionally show ClockView */}
            <ClockView formatter="lineup" startTimestamp={lastEventTimestamp} />
          </Group>
        </Stack>
      </Collapse>
    </Stack>
  );
}
