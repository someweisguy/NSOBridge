import BoutControlButtons from "@/components/bout-control-buttons";
import TeamJamView from "@/components/team-jam-view";
import BoutStateView from "@/features/bout-state-view/bout-state-view";
import TeamView from "@/features/team-view/team-view";
import {
  useActiveJamIndex,
  useActiveTimeoutIndex,
  useBout,
  useLatestJamIndex,
  useLatestTimeoutIndex,
  usePrefetchBoutData,
} from "@/hooks/use-bout";
import { useJam } from "@/hooks/use-jam";
import { useRuleset } from "@/hooks/use-ruleset";
import { useSeries } from "@/hooks/use-series";
import { useTimeout } from "@/hooks/use-timeout";
import queryClient from "@/lib/cache";
import { Team } from "@/lib/game/bouts";
import { redo, undo } from "@/lib/history";
import { BoutContext, JamContext, RulesetContext } from "@/utils/contexts";
import { Container, Grid, MantineProvider, Stack } from "@mantine/core";
import "@mantine/core/styles.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import { usePrefetchServerTime } from "@/hooks/use-server-time";

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
  usePrefetchServerTime();
  const { data: series } = useSeries(0);
  const { data: bout } = useBout(series, 0);
  const { data: ruleset } = useRuleset(bout.seriesId, bout.id);
  usePrefetchBoutData(bout);

  // Fetch Jam data
  const latestJamIndex = useLatestJamIndex(bout);
  const activeJamIndex = useActiveJamIndex(bout);
  const [periodNum, jamNum] = activeJamIndex ?? latestJamIndex;
  const { data: jam } = useJam(bout, periodNum, jamNum);

  // Fetch Timeout data
  const latestTimeoutIndex = useLatestTimeoutIndex(bout);
  const activeTimeoutIndex = useActiveTimeoutIndex(bout);
  const { data: timeout } = useTimeout(
    bout,
    activeTimeoutIndex ?? latestTimeoutIndex,
  );

  return (
    <BoutContext value={bout}>
      <RulesetContext value={ruleset}>
        <Container>
          <Stack>
            <BoutControlButtons bout={bout} />
            <Grid columns={bout.teams.length} align="center">
              <JamContext value={jam}>
                {bout.teams.map((team: Team, i: number) => (
                  <Grid.Col key={i} span={1}>
                    <Stack>
                      <TeamView bout={bout} team={team} timeout={timeout} />
                      <TeamJamView jam={jam} team={team} />
                    </Stack>
                  </Grid.Col>
                ))}
              </JamContext>
            </Grid>
            <Suspense fallback={"Loading..."}>
              <BoutStateView
                bout={bout}
                activeJam={jam}
                latestTimeout={timeout}
              />
            </Suspense>
          </Stack>
        </Container>
      </RulesetContext>
    </BoutContext>
  );
}
