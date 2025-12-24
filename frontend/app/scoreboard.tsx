import BoutStateView from "@/components/bout-state-view";
import TeamView from "@/features/team-view/team-view";
import { usePrefetchBoutData, useSuspenseBout } from "@/hooks/use-bout";
import { useSuspenseJam } from "@/hooks/use-jam";
import { useSuspenseRuleset } from "@/hooks/use-ruleset";
import { useSuspenseSeries } from "@/hooks/use-series";
import { usePrefetchServerTime } from "@/hooks/use-server-time";
import { useSuspenseTimeout } from "@/hooks/use-timeout";
import queryClient from "@/lib/cache";
import { Team } from "@/lib/game/bouts";
import FitScreen from "@fit-screen/react";
import { Center, Grid, MantineProvider, Stack } from "@mantine/core";
import "@mantine/core/styles.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";

const root: HTMLElement = document.getElementById("root")!;
createRoot(root).render(<App />);

export default function App() {
  return (
    <StrictMode>
      <MantineProvider>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={"Loading..."}>
            <FitScreen waitTime={25} mode="fit">
              <Scoreboard />
            </FitScreen>
          </Suspense>
        </QueryClientProvider>
      </MantineProvider>
    </StrictMode>
  );
}

function Scoreboard() {
  usePrefetchServerTime();

  const { data: series } = useSuspenseSeries(0);
  const { data: bout } = useSuspenseBout(series);
  usePrefetchBoutData(bout);

  const { data: ruleset } = useSuspenseRuleset(bout);

  // Fetch Jam data
  const jamIndex = bout.getActiveOrLatestJamIndex();
  const [periodNum, jamNum] = jamIndex;
  const { data: jam } = useSuspenseJam(bout, periodNum, jamNum);

  // Fetch Timeout data
  const timeoutIndex = bout.getActiveOrLatestTimeoutIndex();
  const { data: timeout } = useSuspenseTimeout(bout, timeoutIndex);

  return (
    <Stack>
      <Grid columns={bout.teams.length}>
        {bout.teams.map((team: Team, i: number) => (
          <Grid.Col key={i} span={1}>
            <TeamView
              bout={bout}
              timeout={timeout}
              ruleset={ruleset}
              team={team}
            />
          </Grid.Col>
        ))}
      </Grid>
      <Center>
        <BoutStateView
          bout={bout}
          activeJam={jam}
          latestTimeout={timeout}
          ruleset={ruleset}
        />
      </Center>
    </Stack>
  );
}
