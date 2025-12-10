import Clock from "@/components/clock";
import useActiveJam from "@/hooks/use-active-jam";
import useRuleset from "@/hooks/use-ruleset";
import useTimeout from "@/hooks/use-timeout";
import { Bout } from "@/types/game";
import { Center, Grid, Text } from "@mantine/core";
import JamClock from "../../../components/jam-clock";
import PeriodClock from "../../../components/period-clock";
import IntermissionStateView from "./intermission-state-view";

export default function BoutStateView({ bout }: { bout: Bout }) {
  const ruleset = useRuleset(bout.id);
  const activeJam = useActiveJam(bout.id);
  const latestTimeout = useTimeout(bout.id, bout.numTimeouts - 1);

  if (!bout.isRunning) {
    return <IntermissionStateView bout={bout} />;
  }

  let periodNum = activeJam.period;
  let jamNum = activeJam.num;
  if (activeJam.period >= 2) {
    // Overtime Jams should be considered a continuation of the second half
    periodNum = 1;
    jamNum += bout.jamCounts[1];
  }

  // Render non-Jam Bout states
  let gameStopTimestamp: Date | null = null;
  let gameState = "";
  if (bout.state === "lineup" && activeJam.stopTimestamp != null) {
    gameState = "Lineup";
    gameStopTimestamp = activeJam.stopTimestamp;
  } else if (bout.state === "timeout") {
    gameState = "Timeout";
    gameStopTimestamp = latestTimeout!.startTimestamp;
  }
  // TODO: render additional non-Jam Bout states in extracted component

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
          <Text size="24pt">
            {gameState}&nbsp;
            {gameStopTimestamp && <Clock startTimestamp={gameStopTimestamp} />}
          </Text>
        </Center>
      </Grid.Col>
    </Grid>
  );
}
