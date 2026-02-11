import JamClock from "@/components/jam-clock";
import JamNumber from "@/components/jam-number";
import PeriodClock from "@/components/period-clock";
import TeamProvider from "@/components/team-provider";
import TeamBoutScore from "@/features/team/components/bout-score";
import TeamJamScore from "@/features/team/components/jam-score";
import TeamName from "@/features/team/components/team-name";
import TeamTimeoutBar from "@/features/team/components/timeout-bar";
import { useSuspenseBout } from "@/hooks/use-bout";
import { useJam } from "@/hooks/use-jam";
import { useSuspenseAllSeries } from "@/hooks/use-series";
import { usePrefetchServerTime } from "@/hooks/use-server-time";
import queryClient from "@/lib/cache";
import { Team } from "@/lib/game/bouts";
import { Series } from "@/lib/game/series";
import FitScreen from "@fit-screen/react";
import {
  Center,
  Flex,
  Group,
  MantineProvider,
  SimpleGrid,
  Stack,
} from "@mantine/core";
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
      <Center>
        <Group>
          <Center>
            <PeriodClock size="36pt" />
          </Center>
          <Center>
            <JamNumber size="36pt" />
          </Center>
          <Center>
            <JamClock size="36pt" />
          </Center>
        </Group>
      </Center>
    </Stack>
  );
}
