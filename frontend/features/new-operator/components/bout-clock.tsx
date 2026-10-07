import ClockView from "@/components/clock-view";
import { useSuspenseJam } from "@/hooks/use-jam";
import { useSuspenseGetRuleset } from "@/hooks/use-ruleset";
import { Bout, BoutSubStateString } from "@/types/bout";
import { StopReasonString } from "@/types/jam";
import {
  Collapse,
  Divider,
  Grid,
  Group,
  Stack,
  StackProps,
  Text,
} from "@mantine/core";
import { useMemo } from "react";
import useLatestTimeout from "../hooks/use-latest-timeout";

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
  called: "Called",
  elapsed: "Time",
  injury: "Injury",
  other: "-",
};

export interface BoutClockProps extends StackProps {
  bout: Bout;
}

/**
 * Render the time information relevant to the Bout.
 */
export default function BoutClock({ bout, ...props }: BoutClockProps) {
  const { data: ruleset } = useSuspenseGetRuleset({
    rulesetName: bout.rulesetName,
  });

  const { data: activeJam } = useSuspenseJam({ uuid: bout.activeJamUuid });
  const periodNum = Math.min(activeJam.period, 1) + 1;
  let jamNum = activeJam.num + 1;
  if (activeJam.period > 1) {
    jamNum += bout.jamUuids[1].length;
  }
  const { data: latestTimeout } = useLatestTimeout({ ...bout });

  // Get the time since the last Jam or Timeout or null if neither have occurred
  const lastEventTimestamp: string | null = useMemo(
    () =>
      activeJam.startTimestamp != null
        ? new Date(
            Math.max(
              ...[
                activeJam.startTimestamp,
                activeJam.stopTimestamp,
                latestTimeout?.startTimestamp,
                latestTimeout?.stopTimestamp,
              ]
                .filter((val?: string | null) => val != null)
                .map((val: string) => new Date(val).getTime()),
            ),
          ).toISOString()
        : null,
    [activeJam, latestTimeout],
  );

  return (
    <Stack justify="center" align="stretch" gap="0" {...props}>
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
          <ClockView formatter="bout" fz="1.5rem" {...bout.clock} />
        </Grid.Col>
        <Grid.Col span={4}>
          <Text textWrap="nowrap" fz="1.5rem">
            P{periodNum} J{jamNum}
          </Text>
        </Grid.Col>
        <Grid.Col span={4}>
          {activeJam.stopTimestamp == null ? (
            <ClockView
              alarm={ruleset.jamDuration}
              formatter="jam"
              fz="1.5rem"
              {...activeJam}
            />
          ) : (
            <Text fw={200}>
              {stopReasons[activeJam.stopReason!] ?? stopReasons.other}
            </Text>
          )}
        </Grid.Col>
      </Grid>

      <Collapse expanded={bout.state != "jam"} w="100%">
        <Stack justify="start" align="stretch" gap="0">
          <Divider mx="md" />
          <Group
            justify="center"
            align="center"
            p="xs"
            // TODO: set background color according to Bout State
          >
            <Text ta="center">{eventNames[bout.subState] ?? "-"}</Text>
            {/* TODO: conditionally show ClockView */}
            <ClockView formatter="lineup" startTimestamp={lastEventTimestamp} />
          </Group>
        </Stack>
      </Collapse>
    </Stack>
  );
}
