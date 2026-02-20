import AppProvider from "@/components/app-provider";
import BoutClock from "@/components/bout-clock";
import BoutIntermissionLabel from "@/components/bout-intermission-label";
import BoutStatusLabel from "@/components/bout-status-label";
import JamClock from "@/components/jam-clock";
import JamNumber from "@/components/jam-number";
import TeamBoutScore from "@/components/team-bout-score";
import TeamJamScore from "@/components/team-jam-score";
import TeamName from "@/components/team-name";
import TeamProvider from "@/components/team-provider";
import TeamTimeoutsLeft from "@/components/team-timeouts-left";
import { useJam } from "@/hooks/use-jam";
import { usePrefetchServerTime } from "@/hooks/use-server-time";
import { useSuspenseBout } from "@/hooks/use-suspense-bout";
import { useSuspenseGetAllSeries } from "@/hooks/use-suspense-get-all-series";
import { Team } from "@/lib/game/bouts";
import { Series } from "@/lib/game/series";
import FitScreen from "@fit-screen/react";
import { Flex, Group, SimpleGrid, Stack } from "@mantine/core";
import "@mantine/core/styles.css";
import { createRoot } from "react-dom/client";
import "./global.css";

const root: HTMLElement = document.getElementById("root")!;
createRoot(root).render(
  <AppProvider>
    <FitScreen waitTime={25} mode="fit">
      <Scoreboard />
    </FitScreen>
  </AppProvider>,
);

export function Scoreboard() {
  usePrefetchServerTime();

  const { data: allSeries } = useSuspenseGetAllSeries();

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
                <TeamTimeoutsLeft size={24} />
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
            <BoutClock ta="center" />
            <JamNumber ta="center" />
            <JamClock ta="center" />
          </Group>
        )}
        <BoutStatusLabel withClock ta="center" size="24pt" />
      </Stack>
    </Stack>
  );
}
