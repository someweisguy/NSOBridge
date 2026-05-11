import Clock from "@/components/clock";
import PageShell from "@/components/page-shell";
import TeamCard from "@/components/team-card";
import BoutClock from "@/features/bouts/components/bout-clock";
import BoutStatus from "@/features/bouts/components/bout-status";
import useActiveJamUri from "@/features/bouts/hooks/use-active-jam-uri";
import useLatestJamUri from "@/features/bouts/hooks/use-latest-jam-uri";
import useLatestTimeoutUri from "@/features/bouts/hooks/use-latest-timeout-uri";
import JamClock from "@/features/jams/components/jam-clock";
import JammerStateEditor from "@/features/jams/components/jammer-state-editor";
import TeamJamTripHistory from "@/features/jams/components/team-jam-trip-history";
import BoutControl from "@/features/operator/components/bout-control";
import { useJam } from "@/hooks/use-jam";
import { useSuspenseBout } from "@/hooks/use-suspense-bout";
import { useSuspenseGetAllBouts } from "@/hooks/use-suspense-get-all-bouts";
import { useSuspenseJam } from "@/hooks/use-suspense-jam";
import { useSuspenseRuleset } from "@/hooks/use-suspense-ruleset";
import { useTimeout } from "@/hooks/use-timeout";
import { redo, undo } from "@/lib/history";
import { Team } from "@/types/bout";
import { BoutUri } from "@/types/query";
import { isRunning } from "@/utils/time";
import { Card, Collapse, Grid, Group, Stack, Text } from "@mantine/core";
import "@mantine/core/styles.css";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import AppProvider from "./provider";

// Register Ctrl+Z and Ctrl+Y as undo and redo respectively
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey) {
    if (event.key.toLowerCase() === "z") {
      event.preventDefault();
      void undo();
    }
    if (event.key.toLowerCase() === "y") {
      event.preventDefault();
      void redo();
    }
  }
});

const root: HTMLElement | null = document.getElementById("root");
if (root != null) {
  document.title = "NSO Bridge";
  createRoot(root).render(
    <AppProvider>
      <Operator />
    </AppProvider>,
  );
}

/**
 * Display the main scoreboard operator page. This page is used to enter data into the
 * server to run the majority of the game. It serves controls to start and stop the Bout
 * edit the score, call Timeouts, and edit Lineups.
 */
export default function Operator() {
  const { data: allBouts } = useSuspenseGetAllBouts();
  const [boutUri] = useState<BoutUri>({ boutUuid: allBouts[0].uuid });

  const { data: ruleset } = useSuspenseRuleset(boutUri);
  const { data: bout } = useSuspenseBout(boutUri);

  const activeJamUri = useActiveJamUri(bout);
  const { data: activeJam } = useSuspenseJam(activeJamUri);

  const latestJamUri = useLatestJamUri(bout);
  void useJam(latestJamUri); // Used to prevent UI from blinking

  const latestTimeoutUri = useLatestTimeoutUri(bout);
  const { data: latestTimeout } = useTimeout({
    ...latestTimeoutUri,
    enabled: bout.timeoutCount > 0,
    throwOnError: false,
  });

  // Get the time since the last Jam or Timeout or null if neither have occurred
  const lastEventTimestamp: string | null =
    activeJam.stopTimestamp != null && latestTimeout?.stopTimestamp != null
      ? new Date(
          Math.max(
            new Date(activeJam.stopTimestamp).getTime(),
            new Date(latestTimeout.stopTimestamp).getTime(),
          ),
        ).toISOString()
      : (activeJam.stopTimestamp ?? latestTimeout?.stopTimestamp ?? null);

  return (
    <PageShell>
      <Stack gap="sm">
        {/* Bout State control */}
        <BoutControl
          latestPeriodNum={latestJamUri.periodNum}
          latestJamNum={latestJamUri.jamNum}
          latestTimeoutNum={latestTimeoutUri.timeoutNum}
          teamData={bout.teams.map((team: Team) => {
            return { label: team.name, value: String(team.num) };
          })}
          {...bout}
          {...activeJam}
          {...latestTimeout}
        />

        {/* Team information */}
        <Group justify="space-around">
          {bout.teams.map((team: Team, i: number) => (
            <TeamCard
              key={i}
              teamName={team.name}
              reverse={!!(i % 2)}
              timeoutIsActive={
                latestTimeout != null &&
                isRunning(latestTimeout) &&
                latestTimeout.teamNum === team.num
              }
              {...bout}
              {...team}
              {...latestTimeout}
              {...ruleset}
            />
          ))}
        </Group>

        {/* Bout State View */}
        <Group gap="xl" fz="24pt" ta="center" justify="center" align="center">
          <Card withBorder w="content" bg="gray.0">
            <Grid justify="space-between" align="center" gap="sm">
              <Grid.Col span={4}>
                <BoutClock uuid={bout.uuid} {...bout.clock} inherit />
              </Grid.Col>
              <Grid.Col span={4}>
                <Group justify="space-between">
                  <Text inherit w="300">
                    P{activeJam.period + 1} J{activeJam.num + 1}
                  </Text>
                </Group>
              </Grid.Col>
              <Grid.Col span={4}>
                <JamClock
                  jamDuration={ruleset.jamDuration}
                  {...activeJam}
                  {...activeJamUri}
                  inherit
                />
              </Grid.Col>
            </Grid>
          </Card>
          <Collapse
            keepMounted
            orientation="horizontal"
            expanded={bout.state != "jam"}
          >
            <Card withBorder w="250" bg="yellow.3">
              <Group justify="center" wrap="nowrap">
                <BoutStatus {...bout} inherit />
                {lastEventTimestamp != null && (
                  <Clock startTimestamp={lastEventTimestamp} inherit />
                )}
              </Group>
            </Card>
          </Collapse>
        </Group>

        {/* TeamJam score editors */}
        <Group justify="space-around">
          {[...Array(2).keys()].map((i: number) => (
            <Card withBorder bg="gray.0" key={i}>
              <Stack>
                <JammerStateEditor
                  teamJamUri={{ teamNum: bout.teams[i].num, ...activeJamUri }}
                  isLeadEligible={true} // TODO: check if lead eligible
                  teamJam={
                    activeJam.teamJams.find(
                      (tj) => tj.teamNum == bout.teams[i].num,
                    )!
                  }
                  justify="center"
                  gap="md"
                />
                <TeamJamTripHistory
                  numPasses={ruleset.pointsPerTrip}
                  teamJamUri={{ teamNum: bout.teams[i].num, ...activeJamUri }}
                  events={
                    activeJam.teamJams.find(
                      (tj) => tj.teamNum == bout.teams[i].num,
                    )!.events
                  }
                />
              </Stack>
            </Card>
          ))}
        </Group>

        {/* TODO: Add lineup editors */}
      </Stack>
    </PageShell>
  );
}
