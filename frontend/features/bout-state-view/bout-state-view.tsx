import ExtraordinaryStateClock from "@/components/extraordinary-state-clock";
import IntermissionState from "@/features/bout-state-view/intermission-state-view";
import JamClock from "@/components/jam-clock";
import PeriodClock from "@/components/period-clock";
import { Bout } from "@/lib/game/bouts";
import { Jam } from "@/lib/game/jams";
import { Ruleset } from "@/lib/game/ruleset";
import { Timeout } from "@/lib/game/timeouts";
import { Center, Grid, Text } from "@mantine/core";

interface BoutStateViewProps {
  bout: Bout;
  activeOrLatestJam: Jam;
  activeTimeout: Timeout | null;
  ruleset: Ruleset;
}

export default function BoutStateView({
  bout,
  activeOrLatestJam,
  activeTimeout: latestTimeout,
  ruleset,
}: BoutStateViewProps) {
  if (!bout.isRunning) {
    return (
      <Center>
        <IntermissionState size="36pt" bout={bout} />
      </Center>
    );
  }

  let [periodNum, jamNum] = bout.getActiveOrLatestJamNum();
  if (periodNum >= 2) {
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
            jam={activeOrLatestJam}
            jamDuration={ruleset.jamDuration}
          />
        </Center>
      </Grid.Col>

      <Grid.Col span={1} offset={1}>
        <Center>
          <ExtraordinaryStateClock
            size="24pt"
            bout={bout}
            activeJam={activeOrLatestJam}
            latestTimeout={latestTimeout}
          />
        </Center>
      </Grid.Col>
    </Grid>
  );
}
