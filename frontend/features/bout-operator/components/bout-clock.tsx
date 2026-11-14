import ClockView from "@/components/clock-view";
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

/**
 * Describes the sub-state of the Bout. This is used for more descriptive event
 * states.
 */
export type BoutEvent =
  | "pregame"
  | "halftime"
  | "unofficial"
  | "lineup"
  | "post_review"
  | "post_timeout"
  | "jam"
  | "timeout"
  | "review"
  | "team_timeout"
  | "official_timeout"
  | "final";

const eventNames: Record<BoutEvent, string> = {
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

const overtimeText = "OT";

export interface BoutClockProps extends StackProps {
  boutClock: Clock | undefined;
  isInOvertime: boolean;
  periodNum: number | null;
  jamNum: number | null;
  showJamClock: boolean;
  jamStartTimestamp: string | null;
  jamStopReason: StopReasonString | null | undefined;
  showBoutEvent: boolean;
  boutEvent: BoutEvent | null;
  boutEventStartTimestamp: string | null;
  jamDuration: number | undefined;
}

/**
 * Render the time information relevant to the Bout.
 */
export default function BoutClock({
  boutClock,
  isInOvertime,
  periodNum,
  jamNum,
  showJamClock,
  jamStopReason,
  jamStartTimestamp,
  jamDuration,
  showBoutEvent,
  boutEvent,
  boutEventStartTimestamp,
  ...props
}: BoutClockProps) {
  const hasLoaded =
    boutClock != null &&
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
            {isInOvertime ? (
              <Text fz="1.5rem" tt="uppercase" fw={350}>
                {overtimeText}
              </Text>
            ) : (
              <ClockView formatter="bout" fz="1.5rem" {...boutClock} />
            )}
          </Grid.Col>
          <Grid.Col span={4}>
            <Text textWrap="nowrap" fz="1.5rem">
              P{periodNum + 1} J{jamNum + 1}
            </Text>
          </Grid.Col>
          <Grid.Col span={4}>
            {showJamClock ? (
              <ClockView
                startTimestamp={jamStartTimestamp}
                alarm={jamDuration}
                formatter="jam"
                fz="1.5rem"
              />
            ) : (
              <Text fw={200} tt="uppercase" c="dimmed">
                {stopReasons[jamStopReason ?? "other"]}
              </Text>
            )}
          </Grid.Col>
        </Grid>
      ) : (
        <Loader type="dots" size="xs" />
      )}

      <Collapse expanded={showBoutEvent} w="100%">
        <Stack justify="start" align="stretch" gap="0">
          <Divider mx="0.5rem" />
          <Group
            justify="center"
            align="center"
            p="xs"
            // TODO: set background color according to Bout State
          >
            <Text ta="center">
              {boutEvent != null && eventNames[boutEvent]}
            </Text>
            {boutEventStartTimestamp != null && (
              <ClockView
                formatter="lineup"
                startTimestamp={boutEventStartTimestamp}
              />
            )}
          </Group>
        </Stack>
      </Collapse>
    </Stack>
  );
}
