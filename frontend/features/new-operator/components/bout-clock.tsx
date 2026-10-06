import ClockView from "@/components/clock-view";
import { useSuspenseJam } from "@/hooks/use-jam";
import { useSuspenseGetRuleset } from "@/hooks/use-ruleset";
import { Bout, BoutSubStateString } from "@/types/bout";
import {
  Collapse,
  Divider,
  Grid,
  Group,
  Paper,
  PaperProps,
  Stack,
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

export interface BoutClockProps extends PaperProps {
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

  return (
    <Paper shadow="false" {...props}>
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
          <ClockView {...bout.clock} fz="1.5rem" />
        </Grid.Col>
        <Grid.Col span={4}>
          P{periodNum} J{jamNum}
        </Grid.Col>
        <Grid.Col span={4}>
          {activeJam.stopTimestamp == null ? (
            <ClockView alarm={ruleset.jamDuration} {...activeJam} fz="1.5rem" />
          ) : (
            "-" // TODO: show jam stop reason
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
            // bg={"red"}
          >
            <Text ta="center">{eventNames[bout.subState] ?? "-"}</Text>
            <ClockView formatter="lineup" {...activeJam} />
          </Group>
        </Stack>
      </Collapse>
    </Paper>
  );
}
