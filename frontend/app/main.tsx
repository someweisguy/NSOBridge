import BoutStateView from "@/features/bout-state-view/bout-state-view";
import TeamJamView from "@/components/team-jam-view";
import TeamView from "@/features/team-view/team-view";
import useActiveJam from "@/hooks/use-active-jam";
import useBout from "@/hooks/use-bout";
import useSeries from "@/hooks/use-series";
import queryClient from "@/lib/cache";
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
import { Bout, Series, Team } from "@/types/game";
import {
  Button,
  Container,
  Grid,
  Group,
  MantineProvider,
  Stack,
} from "@mantine/core";
import "@mantine/core/styles.css";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  StrictMode,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import { BoutContext, JamContext } from "@/utils/contexts";

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey) {
    if (event.key === "z") {
      void undo();
    }
    if (event.key === "y") {
      void redo();
    }
  }
});

const root: HTMLElement = document.getElementById("root")!;
createRoot(root).render(<App />);

export default function App() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <Suspense fallback={"Loading..."}>
            <Test />
          </Suspense>
        </MantineProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}

function Test() {
  const [boutIndex, setBoutIndex] = useState(0);
  const goToNextBout = useRef(false);

  const series: Series = useSeries(1);
  if (series.boutIds.length == 0) {
    // TODO: Go to Bout creation page
    throw new Error("This Series does not have any Bouts");
  }
  const bout: Bout = useBout(series.boutIds[boutIndex]);

  useEffect(() => {
    if (goToNextBout.current && series.boutIds.length > boutIndex + 1) {
      goToNextBout.current = false;
      setBoutIndex((i) => i + 1);
    }
  }, [series, boutIndex]);

  const createBoutCallback = useCallback(() => {
    const rosterIds = bout.teams.map((t) => t.rosterId);
    goToNextBout.current = true;
    void createBout(rosterIds);
  }, [bout]);

  const activeJam = useActiveJam(bout.id);

  return (
    <BoutContext value={bout}>
      <Container>
        <Stack>
          <Grid columns={bout.teams.length} align="center">
            <JamContext value={activeJam}>
              {bout.teams.map((team: Team, i: number) => (
                <Grid.Col key={i} span={1}>
                  <Stack>
                    <TeamView team={team} />
                    <TeamJamView jam={activeJam} team={team} />
                  </Stack>
                </Grid.Col>
              ))}
            </JamContext>
          </Grid>
          <BoutStateView bout={bout} />
          <Group>
            <Button onClick={() => void beginPeriod(bout.id)}>
              Start Period
            </Button>
            <Button onClick={() => void startJam(bout.id)}>Start Jam</Button>
            <Button onClick={() => void stopJam(bout.id)}>Stop Jam</Button>
            <Button onClick={() => void startTimeout(bout.id)}>
              Call Timeout
            </Button>
            <Button onClick={() => void stopTimeout(bout.id)}>
              End Timeout
            </Button>
            <Button onClick={() => void endPeriod(bout.id)}>End Period</Button>
            <Button onClick={createBoutCallback}>New Bout</Button>
            <Button onClick={() => void undo()}>Undo</Button>
            <Button onClick={() => void redo()}>Redo</Button>
          </Group>
        </Stack>
      </Container>
    </BoutContext>
  );
}
