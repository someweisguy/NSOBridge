import JamClock from "@/components/jam-clock";
import PeriodClock from "@/components/period-clock";
import ExtraordinaryStateClock from "@/features/bout-state-view/extraordinary-state-clock";
import IntermissionState from "@/features/bout-state-view/intermission-state-view";
import { useSuspenseJam } from "@/hooks/use-jam";
import { useSuspenseRuleset } from "@/hooks/use-ruleset";
import { timeoutQueryOptions } from "@/hooks/use-timeout";
import { Bout } from "@/lib/game/bouts";
import { Timeout } from "@/lib/game/timeouts";
import { Center, Group, Stack, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";

interface BoutStateViewProps {
  bout: Bout;
}

export default function BoutStateView({ bout }: BoutStateViewProps) {
  const { data: ruleset } = useSuspenseRuleset(bout);

  const { data: timeout } = useQuery<Timeout>({
    ...timeoutQueryOptions(bout, bout.timeoutCount - 1),
    enabled: bout.timeoutCount > 0,
    placeholderData: new Timeout(),
  });

  // Fetch Jam data
  let [periodNum, jamNum] = bout.getActiveOrLatestJamNum();
  const { data: jam } = useSuspenseJam(bout, periodNum, jamNum);

  if (!bout.isRunning) {
    return (
      <Center>
        <IntermissionState size="36pt" bout={bout} />
      </Center>
    );
  }

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
          <JamClock size="36pt" jam={jam} jamDuration={ruleset.jamDuration} />
        </Center>
      </Group>

      <Center>
        <ExtraordinaryStateClock
          size="24pt"
          bout={bout}
          activeJam={jam}
          activeTimeout={timeout!}
        />
      </Center>
    </Stack>
  );
}
