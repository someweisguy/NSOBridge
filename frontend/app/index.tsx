import AppProvider from "@/components/app-provider";
import TimeoutProvider from "@/components/timeout-provider";
import BoutClock from "@/features/bouts/components/bout-clock";
import BoutJamControl from "@/features/bouts/components/bout-jam-control";
import BoutPeriodControl from "@/features/bouts/components/bout-period-control";
import BoutStatusContainer from "@/features/bouts/components/bout-status-container";
import BoutTimeoutControl from "@/features/bouts/components/bout-timeout-control";
import TeamBoutScore from "@/features/bouts/components/team-bout-score";
import TeamJamScore from "@/features/bouts/components/team-jam-score";
import JamNumber from "@/features/jams/components/jam-number";
import JamStatusContainer from "@/features/jams/components/jam-status-container";
import TeamJamJammerStateEditorContainer from "@/features/jams/components/team-jam-jammer-state-container";
import TeamJamPassEditorContainer from "@/features/jams/components/team-jam-pass-editor-container";
import TeamJamTripHistoryContainer from "@/features/jams/components/team-jam-trip-history-container";
import JamStopReasonControlContainer from "@/features/operator/components/jam-stop-reason-control-container";
import TimeoutCallerEditor from "@/features/operator/components/timeout-caller-editor";
import TimeoutRetainedEditor from "@/features/operator/components/timeout-retained-editor";
import TimeoutTypeEditor from "@/features/operator/components/timeout-type-editor";
import TimeoutsLeftContainer from "@/features/timeouts/components/timeouts-left-container";
import { useJam } from "@/hooks/use-jam";
import { usePrefetchServerTime } from "@/hooks/use-prefetch-server-time";
import { Bout, Team } from "@/lib/game/bouts";
import { redo, undo } from "@/lib/history";
import { BoutContext } from "@/utils/contexts";
import { Center, Flex, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import "@mantine/core/styles.css";
import { Suspense, useContext } from "react";
import { createRoot } from "react-dom/client";
import { twMerge } from "tailwind-merge";
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

  // Prefetch latest Jam to avoid UI blinking
  // TODO: Remove this line when implementing Lineup Editors
  void useJam(bout, ...bout.getLatestJamNum());

  return (
    <Stack align="stretch" justify="flex-start">
      {/* Team information */}
      <SimpleGrid cols={bout.teams.length}>
        {bout.teams.map((team: Team, i: number) => (
          <Stack key={i} justify="center">
            <Text ta="center" fw="bolder" size="36pt">
              {team.name}
            </Text>
            <Flex
              direction={i % 2 ? "row-reverse" : "row"}
              align="center"
              justify="center"
              gap="md"
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
        ))}
      </SimpleGrid>

      {/* Bout State View */}
      <Stack fz="36pt" ta="center" align="stretch">
        <Center>
          <Group grow justify="center" w="75%" ta="center">
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
            <JamStatusContainer
              bout={bout}
              periodNum={activePeriodNum}
              jamNum={activeJamNum}
              inherit
            />
          </Group>
        </Center>
        <BoutStatusContainer
          className={twMerge(bout.state == "jam" && "invisible")}
          bout={bout}
          inherit
          fz="24pt"
        />
      </Stack>

      {/* Bout State control */}
      <Group justify="center" mih="75">
        <BoutJamControl bout={bout} />
        <BoutTimeoutControl bout={bout} variant="subtle" />
        <BoutPeriodControl bout={bout} variant="subtle" />
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
          <JamStopReasonControlContainer
            bout={bout}
            periodNum={activePeriodNum}
            jamNum={activeJamNum}
          />
        )}
      </Group>

      {/* TeamJam score editors */}
      <Suspense fallback={"Loading..."}>
        <SimpleGrid cols={bout.teams.length}>
          {[...Array(2).keys()].map((i: number) => (
            <Stack key={i}>
              <TeamJamJammerStateEditorContainer
                bout={bout}
                periodNum={activePeriodNum}
                jamNum={activeJamNum}
                teamJamNum={i}
              />
              <TeamJamPassEditorContainer
                bout={bout}
                periodNum={activePeriodNum}
                jamNum={activeJamNum}
                teamJamNum={i}
              />
              <TeamJamTripHistoryContainer
                bout={bout}
                periodNum={activePeriodNum}
                jamNum={activeJamNum}
                teamJamNum={i}
              />
            </Stack>
          ))}
        </SimpleGrid>
      </Suspense>

      {/* TODO: Lineup editors */}
    </Stack>
  );
}
