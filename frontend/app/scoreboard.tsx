import JamClock from "@/components/jam-clock";
import JamNumber from "@/components/jam-number";
import PeriodClock from "@/components/period-clock";
import TeamProvider from "@/features/teams/components/team-provider";
import BoutIntermissionLabel from "@/features/bouts/components/intermission-label";
import { BoutStatusLabel } from "@/features/bouts/components/status-label";
import TeamBoutScore from "@/features/teams/components/bout-score";
import TeamJamScore from "@/features/teams/components/jam-score";
import TeamName from "@/features/teams/components/team-name";
import TeamTimeoutBar from "@/features/teams/components/timeout-bar";
import { useSuspenseBout } from "@/hooks/use-bout";
import { useJam } from "@/hooks/use-jam";
import { useSuspenseAllSeries } from "@/hooks/use-series";
import { usePrefetchServerTime } from "@/hooks/use-server-time";
import queryClient from "@/lib/cache";
import { Team } from "@/lib/game/bouts";
import { Series } from "@/lib/game/series";
import FitScreen from "@fit-screen/react";
import { Flex, Group, MantineProvider, SimpleGrid, Stack } from "@mantine/core";
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
      {/* Team information */}
      <SimpleGrid cols={bout.teams.length}>
        {bout.teams.map((team: Team, i: number) => (
          <TeamProvider key={i} team={team}>
            <Stack justify="center">
              <TeamName ta="center" fw="bolder" size="36pt" />
              <Flex
                direction={i % 2 == 0 ? "row" : "row-reverse"}
                align="center"
                justify="center"
                gap="xl"
              >
                <TeamTimeoutBar size={24} />
                <TeamBoutScore fw="bold" w={150} ta="center" size="48pt" />
                <TeamJamScore size="24pt" />
              </Flex>
            </Stack>
          </TeamProvider>
        ))}
      </SimpleGrid>

      {/* TODO: Lead Jam Status */}
      <Stack>
        {bout.state == "stopped" ? (
          <BoutIntermissionLabel ta="center" size="36pt" />
        ) : (
          <Group grow justify="center" align="center">
            <PeriodClock ta="center" />
            <JamNumber ta="center" />
            <JamClock ta="center" />
          </Group>
        )}
        <BoutStatusLabel withClock ta="center" size="24pt" />
      </Stack>
    </Stack>
  );
}
