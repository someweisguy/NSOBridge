import TeamProvider from "@/components/team-provider";
import BoutStateView from "@/features/bout-state-view/bout-state-view";
import TeamView from "@/features/team-view/team-view";
import { useSuspenseBout } from "@/hooks/use-bout";
import { useJam } from "@/hooks/use-jam";
import { useSuspenseAllSeries } from "@/hooks/use-series";
import { usePrefetchServerTime } from "@/hooks/use-server-time";
import queryClient from "@/lib/cache";
import { Team } from "@/lib/game/bouts";
import { Series } from "@/lib/game/series";
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

  const { data: allSeries } = useSuspenseAllSeries();

  const series: Series = allSeries[0];
  const { data: bout } = useSuspenseBout(
    series.boutUuids[series.activeBoutIndex ?? series.boutUuids.length - 1],
  );

  // Eagerly query the latest Jam and Timeout to avoid suspending
  void useJam(bout, ...bout.getLatestJamNum());

  return (
    <Stack>
      <Grid columns={bout.teams.length}>
        {bout.teams.map((team: Team, i: number) => (
          <TeamProvider key={i} team={team}>
            <TeamView bout={bout} />
          </TeamProvider>
        ))}
      </Grid>
      {/* TODO: Lead Jam Status */}
      <Center>
        <BoutStateView bout={bout} />
      </Center>
    </Stack>
  );
}
