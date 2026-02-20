import { AppProvider } from "@/components/app-provider";
import BoutClock from "@/components/bout-clock";
import BoutIntermissionLabel from "@/components/bout-intermission-label";
import { BoutStatusLabel } from "@/components/bout-status-label";
import JamClock from "@/components/jam-clock";
import JamNumber from "@/components/jam-number";
import JamProvider from "@/components/jam-provider";
import TeamBoutScore from "@/components/team-bout-score";
import TeamJamProvider from "@/components/team-jam-provider";
import TeamJamScore from "@/components/team-jam-score";
import TeamJamTripHistory from "@/components/team-jam-trip-history";
import TeamName from "@/components/team-name";
import TeamProvider from "@/components/team-provider";
import TeamTimeoutsLeft from "@/components/team-timeouts-left";
import TimeoutProvider from "@/components/timeout-provider";
import BoutJamControl from "@/features/operator/components/bout-jam-control";
import BoutPeriodControl from "@/features/operator/components/bout-period-control";
import BoutTimeoutControl from "@/features/operator/components/bout-timeout-control";
import TeamJamJammerState from "@/features/operator/components/team-jam-jammer-state";
import TeamJamPassEditor from "@/features/operator/components/team-jam-pass-editor";
import TimeoutCallerEditor from "@/features/operator/components/timeout-caller-editor";
import TimeoutRetainedEditor from "@/features/operator/components/timeout-retained-editor";
import TimeoutTypeEditor from "@/features/operator/components/timeout-type-editor";
import { usePrefetchServerTime } from "@/hooks/use-server-time";
import { Bout, Team } from "@/lib/game/bouts";
import { redo, undo } from "@/lib/history";
import { BoutContext } from "@/utils/contexts";
import { Center, Flex, Group, SimpleGrid, Stack } from "@mantine/core";
import "@mantine/core/styles.css";
import { Suspense, useContext } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";

// Register Ctrl+Z and Ctrl+Y as undo and redo respectively
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
createRoot(root).render(
  <AppProvider useShell>
    <Operator />
  </AppProvider>,
);

export default function Operator() {
  const bout: Bout | null = useContext(BoutContext);
  if (bout == null) {
    throw new Error("Operator must be used within a BoutProvider");
  }
  usePrefetchServerTime();

  const [activePeriodNum, activeJamNum] = bout.getActiveOrLatestJamNum();
  const [latestPeriodNum, latestJamNum] = bout.getLatestJamNum();

  return (
    <Stack align="stretch" justify="flex-start">
      {/* Team information */}
      <SimpleGrid cols={bout.teams.length}>
        {bout.teams.map((team: Team, i: number) => (
          <TeamProvider key={i} team={team}>
            <Stack justify="center">
              <TeamName ta="center" fw="bolder" size="36pt" />
              <Flex
                direction={i % 2 ? "row-reverse" : "row"}
                align="center"
                justify="center"
                gap="md"
              >
                <TeamTimeoutsLeft size={24} />
                <TeamBoutScore fw="bold" w={150} ta="center" size="48pt" />
                <TeamJamScore
                  ta={i % 2 ? "right" : "left"}
                  size="24pt"
                  w={50}
                />
              </Flex>
            </Stack>
          </TeamProvider>
        ))}
      </SimpleGrid>

      {/* Bout State View */}
      <Stack fz="36pt" ta="center" align="stretch">
        <Center>
          {bout.state == "stopped" ? (
            <BoutIntermissionLabel inherit size="36pt" />
          ) : (
            <Group grow justify="center" w="75%" ta="center">
              <BoutClock inherit />
              <JamNumber inherit />
              <JamClock inherit />
            </Group>
          )}
        </Center>
        <BoutStatusLabel withClock inherit fz="24pt" mih="50" />
      </Stack>

      {/* Bout State control */}
      <Group justify="center" mih="75">
        <BoutJamControl />
        <BoutTimeoutControl variant="subtle" />
        <BoutPeriodControl variant="subtle" />
        {bout.state == "timeout" && (
          <Suspense>
            <TimeoutProvider bout={bout} timeoutNum={bout.timeoutCount - 1}>
              <TimeoutTypeEditor />
              <TimeoutCallerEditor />
              <TimeoutRetainedEditor variant="outline" />
            </TimeoutProvider>
          </Suspense>
        )}
        {bout.state == "lineup" && bout.jamCounts[activePeriodNum] > 1 && (
          <JamProvider
            bout={bout}
            periodNum={activePeriodNum}
            jamNum={activeJamNum}
          >
            {/* TODO: call reason controls */}
          </JamProvider>
        )}
      </Group>

      {/* TeamJam score editors */}
      <Suspense fallback={"Loading..."}>
        <JamProvider
          bout={bout}
          periodNum={activePeriodNum}
          jamNum={activeJamNum}
        >
          <SimpleGrid cols={bout.teams.length}>
            {[...Array(2).keys()].map((i: number) => (
              <TeamJamProvider key={i} teamJamNum={i}>
                <Stack>
                  <TeamJamJammerState />
                  <TeamJamPassEditor />
                  <TeamJamTripHistory />
                </Stack>
              </TeamJamProvider>
            ))}
          </SimpleGrid>
        </JamProvider>
      </Suspense>

      {/* Lineup editors */}
      <Suspense>
        <JamProvider
          bout={bout}
          periodNum={latestPeriodNum}
          jamNum={latestJamNum}
        >
          {/* TODO */}
        </JamProvider>
      </Suspense>
    </Stack>
  );
}
