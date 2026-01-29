import ExtraordinaryStateClock from "@/components/extraordinary-state-clock";
import JamClock from "@/components/jam-clock";
import PeriodClock from "@/components/period-clock";
import IntermissionState from "@/features/bout-state-view/intermission-state-view";
import { useSuspenseRuleset } from "@/hooks/use-ruleset";
import { Bout } from "@/lib/game/bouts";
import { Jam } from "@/lib/game/jams";
import { Timeout } from "@/lib/game/timeouts";
import { Center, Group, Stack, Text } from "@mantine/core";

interface BoutStateViewProps {
  bout: Bout;
  activeOrLatestJam: Jam;
  activeTimeout: Timeout | null;
}

export default function BoutStateView({
  bout,
  activeOrLatestJam,
  activeTimeout,
}: BoutStateViewProps) {
  const { data: ruleset } = useSuspenseRuleset(bout);

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
    <Stack align="stretch" justify="center">
      <Group grow>
        <Center>
          <PeriodClock size="36pt" bout={bout} />
        </Center>
        <Center>
          <Text size="36pt">
            P{periodNum + 1} J{jamNum + 1}
          </Text>
        </Center>
        <Center>
          <JamClock
            size="36pt"
            jam={activeOrLatestJam}
            jamDuration={ruleset.jamDuration}
          />
        </Center>
      </Group>

      <Center>
        <ExtraordinaryStateClock
          size="24pt"
          bout={bout}
          activeJam={activeOrLatestJam}
          activeTimeout={activeTimeout}
        />
      </Center>
    </Stack>
  );
}
