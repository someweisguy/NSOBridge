import AppProvider from "@/components/app-provider";
import BoutClockContainer from "@/features/bouts/components/bout-clock-container";
import BoutJamControl from "@/features/bouts/components/bout-jam-control";
import BoutPeriodControl from "@/features/bouts/components/bout-period-control";
import StatusClockContainer from "@/features/bouts/components/bout-status-container";
import BoutTimeoutControl from "@/features/bouts/components/bout-timeout-control";
import JamNumber from "@/features/jams/components/jam-number";
import JamStatusContainer from "@/features/jams/components/jam-status-container";
import JammerStateEditorContainer from "@/features/jams/components/jammer-state-container";
import TeamJamPassEditorContainer from "@/features/jams/components/pass-editor-container";
import JamStopReasonEditorContainer from "@/features/jams/components/stop-reason-editor-container";
import TeamJamTripHistoryContainer from "@/features/jams/components/team-jam-trip-history-container";
import TimeoutCallerEditorContainer from "@/features/timeouts/components/timeout-caller-editor-container";
import TimeoutRetainedEditorContainer from "@/features/timeouts/components/timeout-retained-editor-container";
import TimeoutTypeEditorContainer from "@/features/timeouts/components/timeout-type-editor-container";
import TimeoutsLeftContainer from "@/features/timeouts/components/timeouts-left-container";
import { useJam } from "@/hooks/use-jam";
import { useSuspenseBout } from "@/hooks/use-suspense-bout";
import { Team } from "@/lib/game/bouts";
import { redo, undo } from "@/lib/history";
import { BoutUuidContext } from "@/utils/contexts";
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
  const boutUuid: string | null = useContext(BoutUuidContext);
  if (boutUuid == null) {
    throw new Error(
      "Operator page must be used within a BoutUuidContext provider",
    );
  }

  const { data: bout } = useSuspenseBout({ boutUuid });
  const activeJamUri = bout.getActiveJamUri() ?? bout.getLatestJamUri();
  const latestTimeoutUri = bout.getLatestTimeoutUri();

  // Prefetch latest Jam to avoid UI blinking
  // TODO: Remove this line when implementing Lineup Editors
  void useJam({ ...bout.getLatestJamUri() });

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
              <TimeoutsLeftContainer
                teamNum={team.num}
                {...latestTimeoutUri}
                {...team}
                size={24}
              />
              <Text fw="bold" w={150} ta="center" size="48pt">
                {team.boutScore + team.scoreOffset}
              </Text>
              <Text ta={i % 2 ? "right" : "left"} size="24pt" w={50}>
                {team.jamScore}
              </Text>
            </Flex>
          </Stack>
        ))}
      </SimpleGrid>

      {/* Bout State View */}
      <Stack fz="36pt" ta="center" align="stretch">
        <Center>
          <Group grow justify="center" w="75%" ta="center">
            <BoutClockContainer boutUuid={bout.uuid} inherit />
            <JamNumber {...activeJamUri} inherit />
            <JamStatusContainer {...activeJamUri} inherit />
          </Group>
        </Center>
        <StatusClockContainer
          boutUuid={bout.uuid}
          className={twMerge(bout.state == "jam" && "invisible")}
          inherit
          fz="24pt"
        />
      </Stack>

      {/* Bout State control */}
      <Group justify="center" mih="75">
        <BoutJamControl boutUuid={bout.uuid} {...bout} />
        <BoutTimeoutControl boutUuid={bout.uuid} {...bout} variant="subtle" />
        <BoutPeriodControl boutUuid={bout.uuid} {...bout} variant="subtle" />
        {bout.state == "timeout" && (
          <Suspense>
            <TimeoutTypeEditorContainer {...latestTimeoutUri} />
            <TimeoutCallerEditorContainer
              {...latestTimeoutUri}
              data={bout.teams.map((team: Team) => {
                return {
                  value: String(team.num),
                  label: team.name,
                };
              })}
            />
            <TimeoutRetainedEditorContainer
              {...latestTimeoutUri}
              variant="outline"
            />
          </Suspense>
        )}
        {bout.state == "lineup" && activeJamUri.jamNum > 0 && (
          <JamStopReasonEditorContainer {...activeJamUri} />
        )}
      </Group>

      {/* TeamJam score editors */}
      <Suspense fallback={"Loading..."}>
        <SimpleGrid cols={bout.teams.length}>
          {[...Array(2).keys()].map((i: number) => (
            <Stack key={i}>
              <JammerStateEditorContainer
                {...activeJamUri}
                teamNum={bout.teams[i].num}
                justify="center"
                gap="md"
              />
              <TeamJamPassEditorContainer {...activeJamUri} teamNum={i} />
              <TeamJamTripHistoryContainer {...activeJamUri} teamJamNum={i} />
            </Stack>
          ))}
        </SimpleGrid>
      </Suspense>

      {/* TODO: Lineup editors */}
    </Stack>
  );
}
