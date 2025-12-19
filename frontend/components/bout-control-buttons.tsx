import useTimeout from "@/hooks/use-timeout";
import { Bout, createBout, Team } from "@/lib/game/bouts";
import { redo, undo } from "@/lib/history";
import { ActionIcon, Button, Divider, Grid, Group } from "@mantine/core";
import { IconArrowBackUp, IconArrowForwardUp } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import TimeoutButtons from "./timeout-buttons";

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
      mainControls = <LineupControlButtons bout={bout} />;
      break;
    case "timeout":
      mainControls = <TimeoutControlButtons bout={bout} />;
      break;
    case "final":
      mainControls = <FinalControlButtons bout={bout} />;
      break;
  }

  const useUndo = useMutation({
    mutationFn: () => undo(),
  });

  const useRedo = useMutation({
    mutationFn: () => redo(),
  });

  return (
    <Grid columns={5} align="center">
      <Grid.Col span={4}>
        <Group>{mainControls}</Group>
      </Grid.Col>
      <Grid.Col span={1}>
        <Group justify="center">
          <ActionIcon onClick={() => useUndo.mutate()}>
            <IconArrowBackUp />
          </ActionIcon>
          <ActionIcon onClick={() => useRedo.mutate()}>
            <IconArrowForwardUp />
          </ActionIcon>
        </Group>
      </Grid.Col>
    </Grid>
  );
}

function StoppedButtons({ bout }: MainControlProps) {
  const useBeginPeriod = useMutation({
    mutationFn: () => bout.beginPeriod(),
  });

  const useStartJam = useMutation({
    mutationFn: () => bout.startJam(),
  });

  const useEndPeriod = useMutation({
    mutationFn: () => bout.endPeriod(),
  });

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
      <Button
        disabled={endPeriodButtonDisabled}
        onClick={() => useEndPeriod.mutate()}
      >
        {endPeriodButtonText}
      </Button>
    </>
  );
}

function JamButtons({ bout }: MainControlProps) {
  const useStopJam = useMutation({
    mutationFn: () => bout.stopJam(),
  });

  return (
    <>
      <Button onClick={() => useStopJam.mutate()}>Stop Jam</Button>
    </>
  );
}

function LineupControlButtons({ bout }: MainControlProps) {
  const useStartJam = useMutation({
    mutationFn: () => bout.startJam(),
  });

  const useStartTimeout = useMutation({
    mutationFn: () => bout.startTimeout(),
  });

  const useEndPeriod = useMutation({
    mutationFn: () => bout.endPeriod(),
  });

  return (
    <>
      <Button onClick={() => useStartJam.mutate()}>Start Jam</Button>
      <Button onClick={() => useStartTimeout.mutate()}>Call Timeout</Button>
      <Button onClick={() => useEndPeriod.mutate()}>End Period</Button>
    </>
  );
}

function TimeoutControlButtons({ bout }: MainControlProps) {
  const useStopTimeout = useMutation({
    mutationFn: () => bout.stopTimeout(),
  });

  const useStartJam = useMutation({
    mutationFn: () => bout.startJam(),
  });

  const timeout = useTimeout(bout.id, bout.numTimeouts - 1)!;

  return (
    <>
      <Button onClick={() => useStopTimeout.mutate()}>End Timeout</Button>
      <Button onClick={() => useStartJam.mutate()}>Start Jam</Button>
      <Divider orientation="vertical" />
      <TimeoutButtons timeout={timeout} teams={bout.teams} />
    </>
  );
}

function FinalControlButtons({ bout }: MainControlProps) {
  const useCreateNewBout = useMutation({
    mutationFn: () => createBout(bout.teams.map((team: Team) => team.rosterId)),
  });

  return (
    <>
      <Button onClick={() => useCreateNewBout.mutate()}>New Bout</Button>
    </>
  );
}
