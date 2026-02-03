import {
  useBeginPeriod,
  useEndPeriod,
  useStartJam,
  useStartTimeout,
  useStopJam,
  useStopTimeout,
} from "@/hooks/use-bout";
import { useRedo, useUndo } from "@/hooks/use-history";
import { timeoutQueryOptions } from "@/hooks/use-timeout";
import { Bout } from "@/lib/game/bouts";
import { Timeout } from "@/lib/game/timeouts";
import { BoutContext } from "@/utils/contexts";
import { ActionIcon, Button, Divider, Grid, Group } from "@mantine/core";
import { IconArrowBackUp, IconArrowForwardUp } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import TimeoutButtons from "./timeout-buttons";

interface MainControlProps {
  bout: Bout;
}

export default function BoutControlButtons() {
  const bout = useContext(BoutContext);
  if (bout == null) {
    throw new Error("AddTripButtons must be inside a Bout context");
  }

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
  const endPeriod = useStartJam(bout);

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

  const { data } = useQuery<Timeout>({
    ...timeoutQueryOptions(bout, bout.timeoutCount - 1),
    enabled: bout.timeoutCount > 0,
    placeholderData: new Timeout(),
  });

  return (
    <>
      <Button onClick={() => stopTimeout.mutate()}>End Timeout</Button>
      <Button onClick={() => startJam.mutate()}>Start Jam</Button>
      <Divider orientation="vertical" />
      <TimeoutButtons timeout={data!} teams={bout.teams} />
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
