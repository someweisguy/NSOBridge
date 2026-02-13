import { useRedo } from "@/hooks/use-redo";
import { useTimeout } from "@/hooks/use-timeout";
import { useUndo } from "@/hooks/use-undo";
import { Bout } from "@/lib/game/bouts";
import { Timeout } from "@/lib/game/timeouts";
import { ActionIcon, Button, Divider, Grid, Group } from "@mantine/core";
import { IconArrowBackUp, IconArrowForwardUp } from "@tabler/icons-react";
import { useBeginPeriod } from "../bouts/hooks/begin-period";
import { useEndPeriod } from "../bouts/hooks/end-period";
import { useStartJam } from "../bouts/hooks/start-jam";
import { useStartTimeout } from "../bouts/hooks/start-timeout";
import { useStopJam } from "../bouts/hooks/stop-jam";
import { useStopTimeout } from "../bouts/hooks/stop-timeout";
import TimeoutButtons from "./timeout-buttons";

interface MainControlProps {
  bout: Bout;
}

export default function BoutControlButtons({ bout }: MainControlProps) {
  let mainControls = <></>;
  switch (bout.state) {
    case "stopped":
      mainControls = <StoppedButtons bout={bout} />;
      break;
    case "jam":
      mainControls = <JamButtons bout={bout} />;
      break;
    case "lineup":
      mainControls = <LineupControlButtons bout={bout} />;
      break;
    case "timeout":
      mainControls = <TimeoutControlButtons bout={bout} />;
      break;
    case "final":
      mainControls = <FinalControlButtons bout={bout} />;
      break;
  }

  const undo = useUndo();
  const redo = useRedo();

  return (
    <Grid columns={5} align="center">
      <Grid.Col span={4}>
        <Group>{mainControls}</Group>
      </Grid.Col>
      <Grid.Col span={1}>
        <Group justify="center">
          <ActionIcon onClick={() => undo.mutate()}>
            <IconArrowBackUp />
          </ActionIcon>
          <ActionIcon onClick={() => redo.mutate()}>
            <IconArrowForwardUp />
          </ActionIcon>
        </Group>
      </Grid.Col>
    </Grid>
  );
}

function StoppedButtons({ bout }: MainControlProps) {
  const beginPeriod = useBeginPeriod(bout);
  const startJam = useStartJam(bout);
  const endPeriod = useEndPeriod(bout);

  const startJamButtonDisabled = false;
  let startJamText = "Start Jam";

  let endPeriodButtonDisabled = false;
  let endPeriodButtonText = "End Period";

  let beginPeriodButtonDisabled = false;
  let beginPeriodText = "Begin Period";
  if (bout.jamCounts[2] > 1) {
    beginPeriodButtonDisabled = true;
    endPeriodButtonText = "End Bout";
  } else if (bout.jamCounts[2] == 1) {
    beginPeriodText = "Begin OT";
    endPeriodButtonText = "End Bout";
    startJamText = "Start OT Jam";
  } else if (bout.jamCounts[1] == 1) {
    endPeriodButtonDisabled = true;
    beginPeriodText = "Begin P2";
  } else if (bout.jamCounts[0] == 1) {
    endPeriodButtonDisabled = true;
    beginPeriodText = "Begin P1";
  }

  return (
    <>
      <Button
        disabled={beginPeriodButtonDisabled}
        onClick={() => beginPeriod.mutate()}
      >
        {beginPeriodText}
      </Button>
      <Button
        disabled={startJamButtonDisabled}
        onClick={() => startJam.mutate()}
      >
        {startJamText}
      </Button>
      <Button
        disabled={endPeriodButtonDisabled}
        onClick={() => endPeriod.mutate()}
      >
        {endPeriodButtonText}
      </Button>
    </>
  );
}

function JamButtons({ bout }: MainControlProps) {
  const stopJam = useStopJam(bout);

  return (
    <>
      <Button onClick={() => stopJam.mutate()}>Stop Jam</Button>
    </>
  );
}

function LineupControlButtons({ bout }: MainControlProps) {
  const startJam = useStartJam(bout);
  const startTimeout = useStartTimeout(bout);
  const endPeriod = useEndPeriod(bout);

  return (
    <>
      <Button onClick={() => startJam.mutate()}>Start Jam</Button>
      <Button onClick={() => startTimeout.mutate()}>Call Timeout</Button>
      <Button onClick={() => endPeriod.mutate()}>End Period</Button>
    </>
  );
}

function TimeoutControlButtons({ bout }: MainControlProps) {
  const stopTimeout = useStopTimeout(bout);
  const startJam = useStartJam(bout);

  const { data: timeout } = useTimeout(bout, bout.timeoutCount - 1, {
    enabled: bout.timeoutCount > 0,
    placeholderData: new Timeout(),
  });

  return (
    <>
      <Button onClick={() => stopTimeout.mutate()}>End Timeout</Button>
      <Button onClick={() => startJam.mutate()}>Start Jam</Button>
      <Divider orientation="vertical" />
      <TimeoutButtons timeout={timeout!} teams={bout.teams} />
    </>
  );
}

function FinalControlButtons({ bout }: MainControlProps) {
  return (
    <>
      <Button>New Bout{bout.uuid}</Button>
    </>
  );
}
