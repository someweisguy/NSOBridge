import { useRuleset } from "@/hooks/use-ruleset";
import { Bout } from "@/lib/game/bouts";
import { Jam } from "@/lib/game/jams";
import { Center, Grid, Text } from "@mantine/core";
import ExtraordinaryStateClock from "../../components/extraordinary-state-clock";
import IntermissionState from "../../components/intermission-state-view";
import JamClock from "../../components/jam-clock";
import PeriodClock from "../../components/period-clock";

interface BoutStateViewProps {
  bout: Bout;
  activeJam: Jam;
}

export default function BoutStateView({ bout, activeJam }: BoutStateViewProps) {
  const { data: ruleset } = useRuleset(bout.id);

  if (!bout.isRunning) {
    return (
      <Center>
        <IntermissionState size="36pt" bout={bout} />
      </Center>
    );
  }

  let periodNum = activeJam.period;
  let jamNum = activeJam.num;
  if (activeJam.period >= 2) {
    // Overtime Jams should be considered a continuation of the second half
    periodNum = 1;
    jamNum += bout.jamCounts[1];
  }

  return (
    <Grid columns={3}>
      <Grid.Col span={1}>
        <Center>
          <PeriodClock size="36pt" bout={bout} />
        </Center>
      </Grid.Col>
      <Grid.Col span={1}>
        <Center>
          <Text size="36pt">
            P{periodNum + 1} J{jamNum + 1}
          </Text>
        </Center>
      </Grid.Col>
      <Grid.Col span={1}>
        <Center>
          <JamClock
            size="36pt"
            jam={activeJam}
            jamDuration={ruleset.jamDuration}
          />
        </Center>
      </Grid.Col>

      <Grid.Col span={1} offset={1}>
        <Center>
          <ExtraordinaryStateClock size="24pt" bout={bout} />
        </Center>
      </Grid.Col>
    </Grid>
  );
}
