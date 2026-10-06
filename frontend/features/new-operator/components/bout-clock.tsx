import ClockView from "@/components/clock-view";
import { useSuspenseJam } from "@/hooks/use-jam";
import { useSuspenseGetRuleset } from "@/hooks/use-ruleset";
import { Bout } from "@/types/bout";
import { Grid, Paper, PaperProps } from "@mantine/core";

interface BoutClockProps extends PaperProps {
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
    <Paper withBorder m="md" {...props}>
      <Grid
        justify="space-between"
        align="center"
        p="sm"
        ta="center"
        fz="1.5rem"
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
    </Paper>
  );
}
