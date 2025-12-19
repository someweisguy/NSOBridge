import BoutControlButtons from "@/components/bout-control-buttons";
import TeamJamView from "@/components/team-jam-view";
import BoutStateView from "@/features/bout-state-view/bout-state-view";
import TeamView from "@/features/team-view/team-view";
import useBout, { useActiveJam } from "@/hooks/use-bout";
import { useSeries } from "@/hooks/use-series";
import queryClient from "@/lib/cache";
import { Bout, Team } from "@/lib/game/bouts";
import { redo, undo } from "@/lib/history";
import { BoutContext, JamContext } from "@/utils/contexts";
import { Container, Grid, MantineProvider, Stack } from "@mantine/core";
import "@mantine/core/styles.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, Suspense, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";

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

  const { data: series } = useSeries(1);
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

  const { data: activeJam } = useActiveJam(bout);

  return (
    <BoutContext value={bout}>
      <Container>
        <Stack>
          <BoutControlButtons bout={bout} />
          <Grid columns={bout.teams.length} align="center">
            <JamContext value={activeJam}>
              {bout.teams.map((team: Team, i: number) => (
                <Grid.Col key={i} span={1}>
                  <Stack>
                    <TeamView bout={bout} team={team} />
                    <TeamJamView jam={activeJam} team={team} />
                  </Stack>
                </Grid.Col>
              ))}
            </JamContext>
          </Grid>
          <BoutStateView bout={bout} activeJam={activeJam} />
        </Stack>
      </Container>
    </BoutContext>
  );
}
