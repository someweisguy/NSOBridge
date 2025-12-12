import {
  beginPeriod,
  createBout,
  endPeriod,
  startJam,
  startTimeout,
  stopJam,
  stopTimeout,
} from "@/lib/game/bouts";
import { redo, undo } from "@/lib/history";
import { Bout, Team } from "@/types/game";
import { Button, Grid, Group } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";

interface MainControlProps {
  bout: Bout;
}

interface BoutControlButtonsProps {
  bout: Bout;
}

export default function BoutControlButtons({ bout }: BoutControlButtonsProps) {
  let mainControls = <></>;
  switch (bout.state) {
    case "stopped":
      mainControls = <StoppedButtons bout={bout} />;
      break;
    case "jam":
      mainControls = <JamButtons bout={bout} />;
      break;
    case "lineup":
      mainControls = <LineupButtons bout={bout} />;
      break;
    case "timeout":
      mainControls = <TimeoutButtons bout={bout} />;
      break;
    case "final":
      mainControls = <FinalButtons bout={bout} />;
      break;
  }

  const useUndo = useMutation({
    mutationFn: () => undo(),
  });

  const useRedo = useMutation({
    mutationFn: () => redo(),
  });

  return (
    <Grid columns={5}>
      <Grid.Col span={4}>
        <Group>{mainControls}</Group>
      </Grid.Col>
      <Grid.Col span={1}>
        <Group>
          <Button onClick={() => useUndo.mutate()}>Undo</Button>
          <Button onClick={() => useRedo.mutate()}>Redo</Button>
        </Group>
      </Grid.Col>
    </Grid>
  );
}

function StoppedButtons({ bout }: MainControlProps) {
  const useBeginPeriod = useMutation({
    mutationFn: () => beginPeriod(bout.id),
  });

  const useStartJam = useMutation({
    mutationFn: () => startJam(bout.id),
  });

  let beginPeriodButtonDisabled = false;
  let beginPeriodText = "Begin Period";
  if (bout.jamCounts[2] > 1) {
    beginPeriodButtonDisabled = true;
  } else if (bout.jamCounts[2] == 1) {
    beginPeriodText = "Begin OT";
  } else if (bout.jamCounts[1] == 1) {
    beginPeriodText = "Begin P2";
  } else if (bout.jamCounts[0] == 1) {
    beginPeriodText = "Begin P1";
  }

  const startJamButtonDisabled = false;
  const startJamText = "Start Jam";

  // TODO: add endPeriod button in the second half and overtime

  return (
    <>
      <Button
        disabled={beginPeriodButtonDisabled}
        onClick={() => useBeginPeriod.mutate()}
      >
        {beginPeriodText}
      </Button>
      <Button
        disabled={startJamButtonDisabled}
        onClick={() => useStartJam.mutate()}
      >
        {startJamText}
      </Button>
    </>
  );
}

function JamButtons({ bout }: MainControlProps) {
  const useStopJam = useMutation({
    mutationFn: () => stopJam(bout.id),
  });

  return (
    <>
      <Button onClick={() => useStopJam.mutate()}>Stop Jam</Button>
    </>
  );
}

function LineupButtons({ bout }: MainControlProps) {
  const useStartJam = useMutation({
    mutationFn: () => startJam(bout.id),
  });

  const useStartTimeout = useMutation({
    mutationFn: () => startTimeout(bout.id),
  });

  const useEndPeriod = useMutation({
    mutationFn: () => endPeriod(bout.id),
  });

  return (
    <>
      <Button onClick={() => useStartJam.mutate()}>Start Jam</Button>
      <Button onClick={() => useStartTimeout.mutate()}>Call Timeout</Button>
      <Button onClick={() => useEndPeriod.mutate()}>End Period</Button>
    </>
  );
}

function TimeoutButtons({ bout }: MainControlProps) {
  const useStopTimeout = useMutation({
    mutationFn: () => stopTimeout(bout.id),
  });

  const useStartJam = useMutation({
    mutationFn: () => startJam(bout.id),
  });

  return (
    <>
      <Button onClick={() => useStopTimeout.mutate()}>End Timeout</Button>
      <Button onClick={() => useStartJam.mutate()}>Start Jam</Button>
    </>
  );
}

function FinalButtons({ bout }: MainControlProps) {
  const useCreateNewBout = useMutation({
    mutationFn: () => createBout(bout.teams.map((team: Team) => team.rosterId)),
  });

  return (
    <>
      <Button onClick={() => useCreateNewBout.mutate()}>New Bout</Button>
    </>
  );
}
