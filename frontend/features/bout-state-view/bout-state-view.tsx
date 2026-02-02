import ExtraordinaryStateClock from "@/components/extraordinary-state-clock";
import JamClock from "@/components/jam-clock";
import PeriodClock from "@/components/period-clock";
import IntermissionState from "@/features/bout-state-view/intermission-state-view";
import { useSuspenseJam } from "@/hooks/use-jam";
import { useSuspenseRuleset } from "@/hooks/use-ruleset";
import { Timeout } from "@/lib/game/timeouts";
import { BoutContext } from "@/utils/contexts";
import { Center, Group, Stack, Text } from "@mantine/core";
import { useContext } from "react";

interface BoutStateViewProps {
  activeTimeout: Timeout | null;
}

export default function BoutStateView({ activeTimeout }: BoutStateViewProps) {
  const bout = useContext(BoutContext);
  if (bout == null) {
    throw new Error("AddTripButtons must be inside a Bout context");
  }
  const { data: ruleset } = useSuspenseRuleset(bout);

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
          activeTimeout={activeTimeout}
        />
      </Center>
    </Stack>
  );
}
