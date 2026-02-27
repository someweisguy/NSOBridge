import AppProvider from "@/components/app-provider";
import BoutClock from "@/features/bouts/components/bout-clock";
import TeamName from "@/components/team-name";
import TeamProvider from "@/components/team-provider";
import BoutStatusContainer from "@/features/bouts/components/bout-status-container";
import TeamBoutScore from "@/features/bouts/components/team-bout-score";
import TeamJamScore from "@/features/bouts/components/team-jam-score";
import JamNumber from "@/features/jams/components/jam-number";
import JamStatusContainer from "@/features/jams/components/jam-status-container";
import TimeoutsLeftContainer from "@/features/timeouts/components/timeouts-left-container";
import { useJam } from "@/hooks/use-jam";
import { usePrefetchServerTime } from "@/hooks/use-prefetch-server-time";
import { useSuspenseBout } from "@/hooks/use-suspense-bout";
import { useSuspenseGetAllSeries } from "@/hooks/use-suspense-get-all-series";
import { Team } from "@/lib/game/bouts";
import { Series } from "@/lib/game/series";
import FitScreen from "@fit-screen/react";
import { Flex, Group, SimpleGrid, Stack } from "@mantine/core";
import "@mantine/core/styles.css";
import { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { twMerge } from "tailwind-merge";
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
  const [activePeriodNum, activeJamNum] = bout.getActiveOrLatestJamNum();

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
                <TimeoutsLeftContainer bout={bout} {...team} size={24} />
                <TeamBoutScore
                  {...team}
                  fw="bold"
                  w={150}
                  ta="center"
                  size="48pt"
                />
                <TeamJamScore
                  {...team}
                  ta={i % 2 ? "right" : "left"}
                  size="24pt"
                  w={50}
                />
              </Flex>
            </Stack>
          </TeamProvider>
        ))}
      </SimpleGrid>

      {/* TODO: Lead Jam Status */}
      <Stack>
        <Group grow justify="center" align="center">
          <BoutClock
            isOvertime={bout.isOvertime()}
            overtimeText="OT"
            {...bout.clock}
            inherit
          />
          <JamNumber
            periodNum={activePeriodNum}
            jamNum={activeJamNum}
            inherit
          />
          <Suspense>
            <JamStatusContainer
              bout={bout}
              periodNum={activePeriodNum}
              jamNum={activeJamNum}
              inherit
            />
          </Suspense>
        </Group>
        <BoutStatusContainer
          className={twMerge(bout.state == "jam" && "invisible")}
          bout={bout}
          ta="center"
          size="24pt"
        />
      </Stack>
    </Stack>
  );
}
